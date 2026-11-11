import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Table,
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export const RecordsTable = ({
  records,
  pagination,
  loading,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}) => {
  const {
    totalRecords = 0,
    page = 1,
    pageSize = 20,
    totalPages = 1,
    hasNextPage = false,
    hasPrevPage = false,
  } = pagination || {};

  const handleSortClick = (field) => {
    if (!sort) {
      onSortChange(`${field}:asc`);
      return;
    }
    const [currentField, currentDir] = sort.split(':');
    if (currentField === field) {
      if (currentDir === 'asc') {
        onSortChange(`${field}:desc`);
      } else {
        onSortChange(''); // Reset to default
      }
    } else {
      onSortChange(`${field}:asc`);
    }
  };

  const renderSortIndicator = (field) => {
    if (!sort) return <ArrowUpDown size={14} className="sort-icon-neutral" />;
    const [currentField, currentDir] = sort.split(':');
    if (currentField !== field) {
      return <ArrowUpDown size={14} className="sort-icon-neutral" />;
    }
    return currentDir === 'desc' ? (
      <ArrowDown size={14} className="sort-icon-active" />
    ) : (
      <ArrowUp size={14} className="sort-icon-active" />
    );
  };

  const formatTimestamp = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toISOString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="card records-card">
      <div className="card-header table-header-row">
        <div>
          <div className="table-title-wrap">
            <Table size={18} className="text-primary" />
            <h3 className="card-title">Observation Records</h3>
          </div>
          <p className="card-subtitle">
            Showing {records.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(page * pageSize, totalRecords)} of {totalRecords.toLocaleString()} observations
          </p>
        </div>

        {/* Page Size Selector */}
        <div className="page-size-selector">
          <label htmlFor="pageSizeSelect" className="page-size-label">
            Rows per page:
          </label>
          <select
            id="pageSizeSelect"
            className="form-control select-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={loading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Fetching observation records from server..." />
          </div>
        ) : records.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No observations match active filters"
              description="Try adjusting your vehicle class or time range filters."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer select-none"
                    onClick={() => handleSortClick('time')}
                  >
                    <div className="th-sort-content">
                      <span>Time (UTC)</span>
                      {renderSortIndicator('time')}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer select-none"
                    onClick={() => handleSortClick('vehicle_class')}
                  >
                    <div className="th-sort-content">
                      <span>Vehicle Class</span>
                      {renderSortIndicator('vehicle_class')}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer select-none"
                    onClick={() => handleSortClick('x')}
                  >
                    <div className="th-sort-content">
                      <span>X (px)</span>
                      {renderSortIndicator('x')}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer select-none"
                    onClick={() => handleSortClick('y')}
                  >
                    <div className="th-sort-content">
                      <span>Y (px)</span>
                      {renderSortIndicator('y')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id} className="hover-row">
                    <td className="font-mono text-xs text-navy">
                      {formatTimestamp(rec.time)}
                    </td>
                    <td>
                      <span className="badge badge-class">
                        {rec.vehicle_class}
                      </span>
                    </td>
                    <td className="font-mono text-slate-700">
                      {rec.x.toFixed(1)}
                    </td>
                    <td className="font-mono text-slate-700">
                      {rec.y.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="table-pagination-footer">
          <div className="pagination-info">
            Page <strong>{page}</strong> of <strong>{Math.max(1, totalPages)}</strong>
          </div>

          <div className="pagination-nav-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={!hasPrevPage || loading}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={!hasNextPage || loading}
              onClick={() => onPageChange(page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsTable;

