const mongoose = require('mongoose');
const Dataset = require('../models/Dataset');
const { importDatasetWithRollback } = require('../services/csvService');
const {
  getRecords,
  getStatistics,
  getHistogram,
} = require('../services/analyticsService');

/**
 * Helper to fetch dataset and verify ownership
 */
const getOwnedDataset = async (datasetId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(datasetId)) {
    const error = new Error('Invalid dataset identifier.');
    error.statusCode = 400;
    throw error;
  }

  const dataset = await Dataset.findById(datasetId);
  if (!dataset) {
    const error = new Error('Dataset not found.');
    error.statusCode = 404;
    throw error;
  }

  if (dataset.userId.toString() !== userId.toString()) {
    const error = new Error('Access denied. You do not have permission to access this dataset.');
    error.statusCode = 403;
    throw error;
  }

  return dataset;
};

/**
 * @route   GET /api/datasets
 * @desc    Get all datasets uploaded by the authenticated user
 * @access  Private
 */
const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: datasets.length,
      datasets: datasets.map((d) => ({
        id: d._id,
        fileName: d.fileName,
        recordCount: d.recordCount,
        status: d.status,
        errorMessage: d.errorMessage,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/datasets/upload
 * @desc    Upload and process a vehicle observation CSV file
 * @access  Private
 */
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file provided. Please select a .csv file to upload.',
      });
    }

    const dataset = await importDatasetWithRollback(
      req.user._id,
      req.file.originalname,
      req.file.buffer
    );

    res.status(201).json({
      success: true,
      message: 'Dataset uploaded and processed successfully.',
      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
        recordCount: dataset.recordCount,
        status: dataset.status,
        createdAt: dataset.createdAt,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        validationErrors: error.validationErrors || undefined,
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/datasets/:datasetId
 * @desc    Get single dataset details
 * @access  Private
 */
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.datasetId, req.user._id);

    res.status(200).json({
      success: true,
      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
        recordCount: dataset.recordCount,
        status: dataset.status,
        errorMessage: dataset.errorMessage,
        createdAt: dataset.createdAt,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/datasets/:datasetId/records
 * @desc    Get paginated, filtered, and sorted observation records
 * @access  Private
 */
const getDatasetRecords = async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.datasetId, req.user._id);

    if (dataset.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Dataset cannot be explored while in '${dataset.status}' status.`,
      });
    }

    const result = await getRecords(dataset._id, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/datasets/:datasetId/statistics
 * @desc    Calculate backend statistics (Min, Median, Max X and Y)
 * @access  Private
 */
const getDatasetStatistics = async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.datasetId, req.user._id);

    if (dataset.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Statistics cannot be computed for dataset in '${dataset.status}' status.`,
      });
    }

    const stats = await getStatistics(dataset._id, req.query);

    res.status(200).json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/datasets/:datasetId/histogram
 * @desc    Get backend calculated histogram bins with counts
 * @access  Private
 */
const getDatasetHistogram = async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.datasetId, req.user._id);

    if (dataset.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Histogram cannot be computed for dataset in '${dataset.status}' status.`,
      });
    }

    const histogram = await getHistogram(dataset._id, req.query);

    res.status(200).json({
      success: true,
      ...histogram,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/datasets/:datasetId/status
 * @desc    Get processing status of a dataset
 * @access  Private
 */
const getDatasetStatus = async (req, res, next) => {
  try {
    const dataset = await getOwnedDataset(req.params.datasetId, req.user._id);

    res.status(200).json({
      success: true,
      status: dataset.status,
      recordCount: dataset.recordCount,
      errorMessage: dataset.errorMessage,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getDatasets,
  uploadDataset,
  getDatasetById,
  getDatasetRecords,
  getDatasetStatistics,
  getDatasetHistogram,
  getDatasetStatus,
};
