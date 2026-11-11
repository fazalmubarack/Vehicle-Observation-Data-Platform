const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vehicle Observation Data Platform API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

