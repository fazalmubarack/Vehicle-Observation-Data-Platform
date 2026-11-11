import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import datasetService from '../services/datasetService';
import StatCard from '../components/dashboard/StatCard';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import {
  Database,
  Layers,
  UploadCloud,
  ChevronRight,
  Clock,
  FileText,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshTrigger, onOpenUpload } = useOutletContext() || {};

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await datasetService.getDatasets();
      if (data.success) {
        setDatasets(data.datasets || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load datasets. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [refreshTrigger]);

  // Aggregate metrics
  const totalDatasets = datasets.length;
  const totalObservations = datasets.reduce(
    (acc, curr) => (curr.status === 'completed' ? acc + (curr.recordCount || 0) : acc),
    0
  );
  const completedDatasets = datasets.filter((d) => d.status === 'completed').length;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text-wrap">
          <h1 className="welcome-heading">Welcome back, {user?.name || 'Analyst'}</h1>
          <p className="welcome-subtext">
            Explore vehicle spatial coordinates, calculate statistics, and visualize observation histograms.
          </p>
        </div>
        <div className="welcome-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenUpload}
          >
            <UploadCloud size={18} />
            <span>Upload New CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Datasets"
          value={totalDatasets}
          subtitle={`${completedDatasets} active & processed`}
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Total Observations"
          value={totalObservations.toLocaleString()}
          subtitle="Spatial coordinates captured"
          icon={Layers}
          color="navy"
        />
        <StatCard
          title="Completed Ingestions"
          value={completedDatasets}
          subtitle="Ready for deep exploration"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Datasets Table Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Uploaded Datasets</h2>
            <p className="card-subtitle">
              Browse your vehicle observation CSV uploads and access analytics
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchDatasets}
            disabled={loading}
            title="Refresh datasets"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="py-8">
              <LoadingSpinner text="Retrieving your uploaded datasets..." />
            </div>
          ) : datasets.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No datasets uploaded yet"
              description="Upload your first vehicle observation CSV file to explore data records and spatial histograms."
              action={
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenUpload}
                >
                  <UploadCloud size={16} />
                  <span>Upload Your First Dataset</span>
                </button>
              }
            />
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Upload Date</th>
                    <th>Record Count</th>
                    <th>Processing Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => (
                    <tr key={dataset.id} className="hover-row">
                      <td className="font-semibold text-navy">
                        <div className="dataset-name-cell">
                          <FileText size={16} className="text-muted" />
                          <span>{dataset.fileName}</span>
                        </div>
                      </td>
                      <td className="text-muted">
                        <div className="dataset-date-cell">
                          <Clock size={14} />
                          <span>{formatDate(dataset.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="record-count-pill">
                          {dataset.status === 'completed'
                            ? dataset.recordCount.toLocaleString()
                            : '—'}{' '}
                          records
                        </span>
                      </td>
                      <td>
                        <Badge status={dataset.status} />
                        {dataset.status === 'failed' && dataset.errorMessage && (
                          <div className="failed-error-hint" title={dataset.errorMessage}>
                            {dataset.errorMessage.slice(0, 35)}...
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        {dataset.status === 'completed' ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/datasets/${dataset.id}`)}
                          >
                            <span>Open Dataset</span>
                            <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled
                          >
                            <span>{dataset.status}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

