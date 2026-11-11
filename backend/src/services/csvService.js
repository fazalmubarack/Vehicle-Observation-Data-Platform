const crypto = require('crypto');
const stream = require('stream');
const csvParser = require('csv-parser');
const Dataset = require('../models/Dataset');
const Observation = require('../models/Observation');

/**
 * Compute SHA-256 hash of a file buffer
 */
const computeFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Parse CSV buffer into validated records or return detailed validation errors
 * @param {Buffer} buffer
 * @returns {Promise<{ records: Array, rowCount: number }>}
 */
const parseAndValidateCsv = (buffer) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const validationErrors = [];
    let rowNumber = 1; // Header is line 1, data starts at line 2
    let headersValidated = false;
    let headerMapping = null;

    const readable = stream.Readable.from(buffer);

    readable
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, ''), // Clean BOM and whitespace
        })
      )
      .on('headers', (headers) => {
        // Normalize headers
        const normalized = headers.map((h) => h.trim());
        const timeHeader = normalized.find((h) => h.toLowerCase() === 'time');
        const classHeader = normalized.find(
          (h) => h.toLowerCase() === 'vehicle_class' || h.toLowerCase() === 'class'
        );
        const xHeader = normalized.find(
          (h) => h.toLowerCase() === 'x(px)' || h.toLowerCase() === 'x'
        );
        const yHeader = normalized.find(
          (h) => h.toLowerCase() === 'y(px)' || h.toLowerCase() === 'y'
        );

        if (!timeHeader || !classHeader || !xHeader || !yHeader) {
          const missing = [];
          if (!timeHeader) missing.push('time');
          if (!classHeader) missing.push('vehicle_class');
          if (!xHeader) missing.push('x(px)');
          if (!yHeader) missing.push('y(px)');
          headersValidated = false;
          return reject(
            new Error(
              `Invalid CSV format. Missing required column(s): ${missing.join(', ')}. Expected: time, vehicle_class, x(px), y(px)`
            )
          );
        }

        headerMapping = {
          time: timeHeader,
          vehicle_class: classHeader,
          x: xHeader,
          y: yHeader,
        };
        headersValidated = true;
      })
      .on('data', (row) => {
        rowNumber++;

        // If headers failed, stop processing
        if (!headersValidated && headerMapping === null) {
          return;
        }

        const rawTime = row[headerMapping.time];
        const rawClass = row[headerMapping.vehicle_class];
        const rawX = row[headerMapping.x];
        const rawY = row[headerMapping.y];

        // 1. Missing-value validation
        if (
          rawTime === undefined ||
          rawTime === null ||
          rawTime.toString().trim() === ''
        ) {
          validationErrors.push(`Row ${rowNumber}: 'time' is missing or empty`);
          return;
        }

        if (
          rawClass === undefined ||
          rawClass === null ||
          rawClass.toString().trim() === ''
        ) {
          validationErrors.push(`Row ${rowNumber}: 'vehicle_class' is missing or empty`);
          return;
        }

        if (
          rawX === undefined ||
          rawX === null ||
          rawX.toString().trim() === ''
        ) {
          validationErrors.push(`Row ${rowNumber}: 'x(px)' coordinate is missing or empty`);
          return;
        }

        if (
          rawY === undefined ||
          rawY === null ||
          rawY.toString().trim() === ''
        ) {
          validationErrors.push(`Row ${rowNumber}: 'y(px)' coordinate is missing or empty`);
          return;
        }

        // 2. Timestamp validation
        const parsedTime = new Date(rawTime.trim());
        if (isNaN(parsedTime.getTime())) {
          validationErrors.push(
            `Row ${rowNumber}: Invalid timestamp format "${rawTime}". Must be a valid ISO or date-time string.`
          );
          return;
        }

        // 3. Numeric coordinate validation
        const parsedX = Number(rawX);
        const parsedY = Number(rawY);

        if (isNaN(parsedX) || !isFinite(parsedX)) {
          validationErrors.push(
            `Row ${rowNumber}: Invalid numeric value for x(px): "${rawX}"`
          );
          return;
        }

        if (isNaN(parsedY) || !isFinite(parsedY)) {
          validationErrors.push(
            `Row ${rowNumber}: Invalid numeric value for y(px): "${rawY}"`
          );
          return;
        }

        records.push({
          time: parsedTime,
          vehicle_class: rawClass.toString().trim(),
          x: parsedX,
          y: parsedY,
        });
      })
      .on('end', () => {
        // Check for empty CSV
        if (records.length === 0 && validationErrors.length === 0) {
          return reject(
            new Error(
              'CSV file contains no data rows. Please upload a file with header and observation rows.'
            )
          );
        }

        // Never silently ignore invalid rows: if any row is invalid, reject the entire import
        if (validationErrors.length > 0) {
          const sampleErrors = validationErrors.slice(0, 5).join('; ');
          const extraCount = validationErrors.length - 5;
          const errorSummary =
            extraCount > 0
              ? `${sampleErrors}; and ${extraCount} more row error(s)`
              : sampleErrors;

          const error = new Error(`CSV validation failed: ${errorSummary}`);
          error.validationErrors = validationErrors;
          return reject(error);
        }

        resolve({ records, rowCount: records.length });
      })
      .on('error', (err) => {
        reject(new Error(`Failed to parse CSV stream: ${err.message}`));
      });
  });
};

/**
 * Ingest CSV buffer with duplicate detection and atomic rollback strategy
 */
const importDatasetWithRollback = async (userId, fileName, buffer) => {
  // 1. Calculate file hash to prevent duplicate imports for this user
  const fileHash = computeFileHash(buffer);

  const existingCompleted = await Dataset.findOne({
    userId,
    fileHash,
    status: 'completed',
  });

  if (existingCompleted) {
    const error = new Error(
      `Duplicate import detected: You have already uploaded "${existingCompleted.fileName}" with identical content.`
    );
    error.statusCode = 409;
    throw error;
  }

  // 2. Parse and strictly validate CSV in memory before touching DB
  let parsed;
  try {
    parsed = await parseAndValidateCsv(buffer);
  } catch (parseError) {
    parseError.statusCode = 400;
    throw parseError;
  }

  const { records } = parsed;

  // 3. Create dataset record in 'processing' status
  const dataset = await Dataset.create({
    userId,
    fileName,
    fileHash,
    recordCount: 0,
    status: 'processing',
    createdAt: new Date(),
  });

  // 4. Batch insert observations with safe rollback strategy
  try {
    const batchSize = 1000;
    const observationDocs = records.map((rec) => ({
      ...rec,
      datasetId: dataset._id,
    }));

    for (let i = 0; i < observationDocs.length; i += batchSize) {
      const batch = observationDocs.slice(i, i + batchSize);
      await Observation.insertMany(batch, { ordered: true });
    }

    // 5. Update dataset to completed
    dataset.status = 'completed';
    dataset.recordCount = records.length;
    await dataset.save();

    return dataset;
  } catch (insertError) {
    // Safe Rollback Strategy: Delete partial records and remove or mark dataset as failed
    console.error(
      `[CSV Ingestion Error] Failed to persist records for dataset ${dataset._id}. Initiating rollback.`
    );

    try {
      await Observation.deleteMany({ datasetId: dataset._id });
      dataset.status = 'failed';
      dataset.errorMessage = insertError.message;
      await dataset.save();
    } catch (cleanupError) {
      console.error(`[Rollback Error] Cleanup failed: ${cleanupError.message}`);
    }

    const error = new Error(
      `Dataset import failed during database persistence: ${insertError.message}`
    );
    error.statusCode = 500;
    throw error;
  }
};

module.exports = {
  computeFileHash,
  parseAndValidateCsv,
  importDatasetWithRollback,
};

