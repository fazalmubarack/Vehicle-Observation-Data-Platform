const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileHash: {
      type: String,
      required: [true, 'File hash is required'],
      index: true,
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Prevent duplicate imports of the same file by the same user
datasetSchema.index({ userId: 1, fileHash: 1 });

module.exports = mongoose.model('Dataset', datasetSchema);
