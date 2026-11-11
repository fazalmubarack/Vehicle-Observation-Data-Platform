const mongoose = require('mongoose');
const Observation = require('../models/Observation');
const { calculateMedian, generateHistogramBins } = require('../utils/statsHelper');

/**
 * Build Mongoose query filter from request parameters
 */
const buildObservationFilter = (datasetId, query = {}) => {
  const filter = {
    datasetId: new mongoose.Types.ObjectId(datasetId),
  };

  if (query.vehicleClass && query.vehicleClass.trim() !== '') {
    // Case-insensitive vehicle class filter
    filter.vehicle_class = new RegExp(`^${query.vehicleClass.trim()}$`, 'i');
  }

  if (query.from || query.to) {
    filter.time = {};
    if (query.from && query.from.trim() !== '') {
      filter.time.$gte = query.from.trim();
    }
    if (query.to && query.to.trim() !== '') {
      filter.time.$lte = query.to.trim();
    }
    if (Object.keys(filter.time).length === 0) {
      delete filter.time;
    }
  }

  return filter;
};

/**
 * Fetch paginated observation records with sorting and filtering
 */
const getRecords = async (datasetId, query = {}) => {
  const filter = buildObservationFilter(datasetId, query);

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
  const skip = (page - 1) * pageSize;

  // Build sort options (e.g., 'time:asc', 'time:desc', 'x:asc', 'y:desc')
  const sortOptions = {};
  if (query.sort) {
    const [field, direction] = query.sort.split(':');
    const validFields = ['time', 'vehicle_class', 'x', 'y'];
    if (validFields.includes(field)) {
      sortOptions[field] = direction && direction.toLowerCase() === 'desc' ? -1 : 1;
    } else {
      sortOptions.time = 1;
    }
  } else {
    sortOptions.time = 1; // Default chronological order
  }

  const [records, totalCount] = await Promise.all([
    Observation.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Observation.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    records: records.map((r) => ({
      id: r._id,
      time: r.time,
      vehicle_class: r.vehicle_class,
      x: r.x,
      y: r.y,
    })),
    pagination: {
      totalRecords: totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Calculate backend statistics (Min, Median, Max for X and Y) respecting active filters
 */
const getStatistics = async (datasetId, query = {}) => {
  const filter = buildObservationFilter(datasetId, query);

  // Fetch all coordinates matching filter to compute exact min, median, max
  const rows = await Observation.find(filter, { x: 1, y: 1, _id: 0 }).lean();

  if (!rows || rows.length === 0) {
    return {
      totalObservations: 0,
      x: { min: null, median: null, max: null },
      y: { min: null, median: null, max: null },
    };
  }

  const xValues = rows.map((r) => r.x).sort((a, b) => a - b);
  const yValues = rows.map((r) => r.y).sort((a, b) => a - b);

  const minX = xValues[0];
  const maxX = xValues[xValues.length - 1];
  const medianX = calculateMedian(xValues);

  const minY = yValues[0];
  const maxY = yValues[yValues.length - 1];
  const medianY = calculateMedian(yValues);

  return {
    totalObservations: rows.length,
    x: {
      min: Number(minX.toFixed(2)),
      median: medianX,
      max: Number(maxX.toFixed(2)),
    },
    y: {
      min: Number(minY.toFixed(2)),
      median: medianY,
      max: Number(maxY.toFixed(2)),
    },
  };
};

/**
 * Generate histogram bins with observation counts respecting active filters
 */
const getHistogram = async (datasetId, query = {}) => {
  const filter = buildObservationFilter(datasetId, query);
  const metric = query.metric === 'y' ? 'y' : 'x'; // Default to x(px) distribution

  const projection = {};
  projection[metric] = 1;
  projection._id = 0;

  const rows = await Observation.find(filter, projection).lean();
  const values = rows.map((r) => r[metric]);

  const bins = generateHistogramBins(values, 10);

  return {
    metric: metric === 'x' ? 'x(px)' : 'y(px)',
    totalObservations: values.length,
    bins,
  };
};

module.exports = {
  buildObservationFilter,
  getRecords,
  getStatistics,
  getHistogram,
};
