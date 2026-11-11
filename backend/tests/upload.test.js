require('./setup');
const request = require('supertest');
const path = require('path');
const app = require('../src/app');
const Dataset = require('../src/models/Dataset');
const Observation = require('../src/models/Observation');

describe('CSV Upload and Ingestion Module', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Bob Analyst',
      email: 'bob@example.com',
      password: 'Password123!',
    });
    token = reg.body.token;
    userId = reg.body.user.id;
  });

  const sampleCsvPath = path.join(__dirname, '../fixtures/sample_observations.csv');
  const invalidRowsCsvPath = path.join(__dirname, '../fixtures/invalid_rows.csv');

  describe('POST /api/datasets/upload', () => {
    it('should successfully upload and parse a valid vehicle observation CSV file', async () => {
      const res = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', sampleCsvPath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.dataset).toBeDefined();
      expect(res.body.dataset.status).toBe('completed');
      expect(res.body.dataset.recordCount).toBe(15);

      // Verify records stored in database
      const dbObservations = await Observation.find({ datasetId: res.body.dataset.id });
      expect(dbObservations.length).toBe(15);
      expect(dbObservations[0].vehicle_class.toLowerCase()).toBe('car');
      expect(dbObservations[0].x).toBe(1613.0);
      expect(dbObservations[0].y).toBe(744.3);
    });

    it('should prevent duplicate imports of the identical file by the same user', async () => {
      // First upload
      await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', sampleCsvPath);

      // Duplicate upload attempt
      const res = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', sampleCsvPath);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/duplicate import/i);
    });

    it('should reject CSV files with invalid rows and not silently ignore them', async () => {
      const res = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', invalidRowsCsvPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/CSV validation failed/i);
    });

    it('should perform safe rollback and never leave partial database records on failure', async () => {
      const countBefore = await Observation.countDocuments();
      expect(countBefore).toBe(0);

      const res = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', invalidRowsCsvPath);

      expect(res.status).toBe(400);

      // Verify no partial observations remained in database
      const countAfter = await Observation.countDocuments();
      expect(countAfter).toBe(0);
    });

    it('should reject request when no file is attached', async () => {
      const res = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no CSV file provided/i);
    });
  });

  describe('GET /api/datasets/:datasetId/status', () => {
    it('should return dataset status for a valid uploaded dataset', async () => {
      const uploadRes = await request(app)
        .post('/api/datasets/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', sampleCsvPath);

      const datasetId = uploadRes.body.dataset.id;

      const res = await request(app)
        .get(`/api/datasets/${datasetId}/status`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
      expect(res.body.recordCount).toBe(15);
    });
  });
});
