const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: [true, 'Dataset ID is required'],
      index: true,
    },
    time: {
      type: Date,
      required: [true, 'Observation time is required'],
      index: true,
    },
    vehicle_class: {
      type: String,
      required: [true, 'Vehicle class is required'],
      trim: true,
      index: true,
    },
    x: {
      type: Number,
      required: [true, 'X coordinate is required'],
      index: true,
    },
    y: {
      type: Number,
      required: [true, 'Y coordinate is required'],
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for high performance filtering and sorting
observationSchema.index({ datasetId: 1, time: 1 });
observationSchema.index({ datasetId: 1, vehicle_class: 1 });
observationSchema.index({ datasetId: 1, x: 1 });
observationSchema.index({ datasetId: 1, y: 1 });

module.exports = mongoose.model('Observation', observationSchema);

