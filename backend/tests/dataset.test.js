require('./setup');
const request = require('supertest');
const path = require('path');
const app = require('../src/app');

describe('Dataset Explorer and Records Module', () => {
  let userAToken;
  let userBToken;
  let datasetAId;

  const sampleCsvPath = path.join(__dirname, '../fixtures/sample_observations.csv');

  beforeEach(async () => {
    // User A
    const regA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'userA@example.com',
      password: 'Password123!',
    });
    userAToken = regA.body.token;

    // User B
    const regB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userB@example.com',
      password: 'Password123!',
    });
    userBToken = regB.body.token;

    // User A uploads dataset
    const uploadRes = await request(app)
      .post('/api/datasets/upload')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('file', sampleCsvPath);

    datasetAId = uploadRes.body.dataset.id;
  });

  describe('Dataset Ownership Enforcement', () => {
    it('should allow owner (User A) to access their dataset', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.dataset.id).toBe(datasetAId);
    });

    it('should reject non-owner (User B) with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/access denied/i);
    });

    it('should reject non-owner from accessing dataset records', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}/records`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/datasets', () => {
    it('should only return datasets belonging to the requesting user', async () => {
      const resA = await request(app)
        .get('/api/datasets')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(resA.status).toBe(200);
      expect(resA.body.datasets.length).toBe(1);

      const resB = await request(app)
        .get('/api/datasets')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(resB.status).toBe(200);
      expect(resB.body.datasets.length).toBe(0);
    });
  });

  describe('GET /api/datasets/:datasetId/records', () => {
    it('should return paginated records with default page size', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}/records`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.records.length).toBe(15);
      expect(res.body.pagination.totalRecords).toBe(15);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should support custom page and pageSize query parameters', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}/records?page=2&pageSize=5`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.records.length).toBe(5);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.pageSize).toBe(5);
      expect(res.body.pagination.totalPages).toBe(3);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    it('should filter records by vehicleClass', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}/records?vehicleClass=truck`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.records.length).toBe(3); // In sample CSV there are 3 trucks
      res.body.records.forEach((rec) => {
        expect(rec.vehicle_class).toBe('truck');
      });
    });

    it('should filter records by time range (from and to)', async () => {
      const res = await request(app)
        .get(
          `/api/datasets/${datasetAId}/records?from=2026-03-29T08:00:01.000Z&to=2026-03-29T08:00:05.800Z`
        )
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.records.length).toBe(4);
    });

    it('should sort records chronologically or by coordinate', async () => {
      const res = await request(app)
        .get(`/api/datasets/${datasetAId}/records?sort=x:desc`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const xs = res.body.records.map((r) => r.x);
      for (let i = 0; i < xs.length - 1; i++) {
        expect(xs[i]).toBeGreaterThanOrEqual(xs[i + 1]);
      }
    });
  });
});

