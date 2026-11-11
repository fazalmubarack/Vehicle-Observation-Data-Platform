import api from './api';

export const datasetService = {
  async getDatasets() {
    const response = await api.get('/datasets');
    return response.data;
  },

  async uploadDataset(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  async getDatasetById(datasetId) {
    const response = await api.get(`/datasets/${datasetId}`);
    return response.data;
  },

  async getDatasetRecords(datasetId, params = {}) {
    const response = await api.get(`/datasets/${datasetId}/records`, { params });
    return response.data;
  },

  async getDatasetStatistics(datasetId, params = {}) {
    const response = await api.get(`/datasets/${datasetId}/statistics`, { params });
    return response.data;
  },

  async getDatasetHistogram(datasetId, params = {}) {
    const response = await api.get(`/datasets/${datasetId}/histogram`, { params });
    return response.data;
  },

  async getDatasetStatus(datasetId) {
    const response = await api.get(`/datasets/${datasetId}/status`);
    return response.data;
  },
};

export default datasetService;
