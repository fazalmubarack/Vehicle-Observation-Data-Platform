import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import datasetService from '../services/datasetService';
import FiltersBar from '../components/explorer/FiltersBar';
import StatsSidebar from '../components/explorer/StatsSidebar';
import HistogramChart from '../components/explorer/HistogramChart';
import RecordsTable from '../components/explorer/RecordsTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import { ArrowLeft, Database, Calendar, FileText, Layers, RefreshCw } from 'lucide-react';

export const DatasetExplorerPage = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  // Dataset info
  const [dataset, setDataset] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [generalError, setGeneralError] = useState(null);

  // Filters state
  const [vehicleClass, setVehicleClass] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState('');

  // Records state
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Statistics state
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Histogram state
  const [histogramData, setHistogramData] = useState(null);
  const [histogramLoading, setHistogramLoading] = useState(false);
  const [metric, setMetric] = useState('x');

  // Load dataset metadata
  useEffect(() => {
    const fetchDatasetMetadata = async () => {
      setInitialLoading(true);
      setGeneralError(null);
      try {
        const res = await datasetService.getDatasetById(datasetId);
        if (res.success) {
          setDataset(res.dataset);
        }
      } catch (err) {
        setGeneralError(
          err.response?.data?.message || 'Failed to load dataset details.'
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDatasetMetadata();
  }, [datasetId]);

  // Construct query params object for server requests
  const buildQueryParams = useCallback(() => {
    const params = {};
    if (vehicleClass) params.vehicleClass = vehicleClass;
    if (fromTime) params.from = new Date(fromTime).toISOString();
    if (toTime) params.to = new Date(toTime).toISOString();
    return params;
  }, [vehicleClass, fromTime, toTime]);

  // Fetch observation records
  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const params = {
        ...buildQueryParams(),
        page,
        pageSize,
        ...(sort && { sort }),
      };
      const res = await datasetService.getDatasetRecords(datasetId, params);
      if (res.success) {
        setRecords(res.records);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setRecordsLoading(false);
    }
  }, [datasetId, buildQueryParams, page, pageSize, sort]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = buildQueryParams();
      const res = await datasetService.getDatasetStatistics(datasetId, params);
      if (res.success) {
        setStatistics(res.statistics);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [datasetId, buildQueryParams]);

  // Fetch histogram
  const fetchHistogram = useCallback(async () => {
    setHistogramLoading(true);
    try {
      const params = {
        ...buildQueryParams(),
        metric,
      };
      const res = await datasetService.getDatasetHistogram(datasetId, params);
      if (res.success) {
        setHistogramData(res);
      }
    } catch (err) {
      console.error('Failed to fetch histogram:', err);
    } finally {
      setHistogramLoading(false);
    }
  }, [datasetId, buildQueryParams, metric]);

  // When filters change, reset to page 1 and reload all synchronized views
  useEffect(() => {
    setPage(1);
  }, [vehicleClass, fromTime, toTime]);

  // Trigger data fetching on dependencies
  useEffect(() => {
    if (!initialLoading && dataset && dataset.status === 'completed') {
      fetchRecords();
      fetchStatistics();
      fetchHistogram();
    }
  }, [datasetId, initialLoading, dataset, fetchRecords, fetchStatistics, fetchHistogram]);

  const handleResetFilters = () => {
    setVehicleClass('');
    setFromTime('');
    setToTime('');
    setSort('');
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (initialLoading) {
    return (
      <div className="py-20 text-center">
        <LoadingSpinner text="Loading dataset explorer..." size={32} />
      </div>
    );
  }

  if (generalError || !dataset) {
    return (
      <div className="dataset-explorer-page">
        <div className="mb-4">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <Alert
          type="error"
          message={generalError || 'Dataset not found or access denied.'}
        />
      </div>
    );
  }

  return (
    <div className="dataset-explorer-page">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="explorer-header-card">
        <div className="explorer-nav-row">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchRecords();
              fetchStatistics();
              fetchHistogram();
            }}
            title="Refresh current data"
          >
            <RefreshCw size={14} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        <div className="explorer-meta-row">
          <div className="explorer-title-group">
            <div className="file-icon-square">
              <FileText size={24} color="#ffffff" />
            </div>
            <div>
              <div className="file-header-flex">
                <h1 className="explorer-dataset-title">{dataset.fileName}</h1>
                <Badge status={dataset.status} />
              </div>
              <div className="explorer-meta-tags">
                <span className="meta-tag">
                  <Calendar size={13} />
                  <span>Uploaded: {formatDate(dataset.createdAt)}</span>
                </span>
                <span className="meta-tag">
                  <Layers size={13} />
                  <span>{dataset.recordCount.toLocaleString()} Total Records</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <FiltersBar
        vehicleClass={vehicleClass}
        setVehicleClass={setVehicleClass}
        fromTime={fromTime}
        setFromTime={setFromTime}
        toTime={toTime}
        setToTime={setToTime}
        onReset={handleResetFilters}
      />

      {/* Analytics & Visualization Section */}
      <div className="explorer-analytics-grid">
        <div className="analytics-chart-col">
          <HistogramChart
            histogramData={histogramData}
            loading={histogramLoading}
            metric={metric}
            setMetric={setMetric}
          />
        </div>
        <div className="analytics-sidebar-col">
          <StatsSidebar statistics={statistics} loading={statsLoading} />
        </div>
      </div>

      {/* Paginated Observation Records Table */}
      <RecordsTable
        records={records}
        pagination={pagination}
        loading={recordsLoading}
        sort={sort}
        onSortChange={setSort}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
};

export default DatasetExplorerPage;
