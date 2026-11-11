import React from 'react';
import { BarChart3, Layers, Compass } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export const StatsSidebar = ({ statistics, loading }) => {
  if (loading) {
    return (
      <div className="stats-sidebar-card">
        <div className="sidebar-card-title">
          <BarChart3 size={18} className="text-primary" />
          <span>Coordinate Analytics</span>
        </div>
        <div className="py-6">
          <LoadingSpinner text="Computing statistics..." size={20} />
        </div>
      </div>
    );
  }

  const { totalObservations = 0, x = {}, y = {} } = statistics || {};

  const formatVal = (val) => {
    if (val === null || val === undefined) return '—';
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  return (
    <div className="stats-sidebar-card">
      <div className="sidebar-card-title">
        <BarChart3 size={18} className="text-primary" />
        <span>Observation Statistics</span>
      </div>
      <p className="sidebar-card-desc">
        Server-side computed metrics for current dataset and active filters
      </p>

      {/* Total Observations */}
      <div className="sidebar-stat-item highlight-box">
        <div className="stat-label-wrap">
          <Layers size={16} className="text-primary" />
          <span className="stat-label">Total Observations</span>
        </div>
        <span className="stat-big-val">{totalObservations.toLocaleString()}</span>
      </div>

      {/* X Coordinate Stats Group */}
      <div className="stat-group">
        <div className="stat-group-header">
          <Compass size={14} className="text-muted" />
          <span>X Coordinate (px)</span>
        </div>
        <div className="stat-metrics-grid">
          <div className="metric-box">
            <span className="metric-title">Minimum</span>
            <span className="metric-val">{formatVal(x.min)}</span>
          </div>
          <div className="metric-box metric-box-primary">
            <span className="metric-title">Median</span>
            <span className="metric-val">{formatVal(x.median)}</span>
          </div>
          <div className="metric-box">
            <span className="metric-title">Maximum</span>
            <span className="metric-val">{formatVal(x.max)}</span>
          </div>
        </div>
      </div>

      {/* Y Coordinate Stats Group */}
      <div className="stat-group">
        <div className="stat-group-header">
          <Compass size={14} className="text-muted" />
          <span>Y Coordinate (px)</span>
        </div>
        <div className="stat-metrics-grid">
          <div className="metric-box">
            <span className="metric-title">Minimum</span>
            <span className="metric-val">{formatVal(y.min)}</span>
          </div>
          <div className="metric-box metric-box-primary">
            <span className="metric-title">Median</span>
            <span className="metric-val">{formatVal(y.median)}</span>
          </div>
          <div className="metric-box">
            <span className="metric-title">Maximum</span>
            <span className="metric-val">{formatVal(y.max)}</span>
          </div>
        </div>
      </div>

      <div className="stats-footnote">
        &bull; Pixel coordinates accurately calculated by backend statistics engine.
      </div>
    </div>
  );
};

export default StatsSidebar;

