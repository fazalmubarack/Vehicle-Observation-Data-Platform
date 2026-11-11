const express = require('express');
const {
  getDatasets,
  uploadDataset,
  getDatasetById,
  getDatasetRecords,
  getDatasetStatistics,
  getDatasetHistogram,
  getDatasetStatus,
} = require('../controllers/datasetController');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All dataset endpoints require authentication
router.use(authenticateToken);

router.get('/', getDatasets);
router.post('/upload', upload.single('file'), uploadDataset);
router.get('/:datasetId', getDatasetById);
router.get('/:datasetId/records', getDatasetRecords);
router.get('/:datasetId/statistics', getDatasetStatistics);
router.get('/:datasetId/histogram', getDatasetHistogram);
router.get('/:datasetId/status', getDatasetStatus);

module.exports = router;
