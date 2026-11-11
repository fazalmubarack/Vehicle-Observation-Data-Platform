require('./setup');
const request = require('supertest');
const path = require('path');
const app = require('../src/app');

describe('Analytics and Histogram Module', () => {
  let token;
  let datasetId;

  const sampleCsvPath = path.join(__dirname, '../fixtures/sample_observations.csv');

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Data Scientist',
      email: 'scientist@example.com',
      password: 'Password123!',
    });
    token = reg.body.token;

    const uploadRes = await request(app)
      .post('/api/datasets/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', sampleCsvPath);

    datasetId = uploadRes.body.dataset.id;
  });

  describe('GET /api/datasets/:datasetId/statistics', () => {
    it('should calculate accurate min, median, and max for X and Y coordinates on the backend', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetId}/statistics`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.statistics).toBeDefined();

      const stats = res.body.statistics;
      expect(stats.totalObservations).toBe(15);

      // Verify X stats
      expect(stats.x.min).toBe(95.0);
      expect(stats.x.max).toBe(450.2);
      expect(typeof stats.x.median).toBe('number');
      expect(stats.x.median).toBeGreaterThanOrEqual(stats.x.min);
      expect(stats.x.median).toBeLessThanOrEqual(stats.x.max);

      // Verify Y stats
      expect(stats.y.min).toBe(290.4);
      expect(stats.y.max).toBe(530.0);
      expect(typeof stats.y.median).toBe('number');
      expect(stats.y.median).toBeGreaterThanOrEqual(stats.y.min);
      expect(stats.y.median).toBeLessThanOrEqual(stats.y.max);
    });

    it('should dynamically update statistics when active filters are applied', async () => {
      // Filter by vehicleClass=motorcycle (there are 2 motorcycles in sample: x=95.0, 110.2; y=290.4, 305.8)
      const res = await request(app)
        .get(`/api/datasets/${datasetId}/statistics?vehicleClass=motorcycle`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const stats = res.body.statistics;
      expect(stats.totalObservations).toBe(2);
      expect(stats.x.min).toBe(95.0);
      expect(stats.x.max).toBe(110.2);
      expect(stats.x.median).toBe(102.6); // (95.0 + 110.2) / 2 = 102.6
    });
  });

  describe('GET /api/datasets/:datasetId/histogram', () => {
    it('should return backend-calculated histogram bins with labels and observation counts', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetId}/histogram`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.bins).toBeInstanceOf(Array);
      expect(res.body.bins.length).toBeGreaterThan(0);
      expect(res.body.totalObservations).toBe(15);

      let totalCountInBins = 0;
      res.body.bins.forEach((bin) => {
        expect(bin.binLabel).toBeDefined();
        expect(typeof bin.min).toBe('number');
        expect(typeof bin.max).toBe('number');
        expect(typeof bin.count).toBe('number');
        totalCountInBins += bin.count;
      });

      // Sum of counts in bins must equal total observations
      expect(totalCountInBins).toBe(15);
    });

    it('should recalculate histogram bins when active filters are applied', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetId}/histogram?vehicleClass=bus`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalObservations).toBe(2);

      let totalCountInBins = 0;
      res.body.bins.forEach((bin) => {
        totalCountInBins += bin.count;
      });
      expect(totalCountInBins).toBe(2);
    });
  });
});
