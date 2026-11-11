import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-header">Bin Interval: {label} px</div>
        <div className="tooltip-value">
          <span className="tooltip-count">{payload[0].value.toLocaleString()}</span> observations
        </div>
        <div className="tooltip-sub">
          Range: [{data.min} to {data.max} px]
        </div>
      </div>
    );
  }
  return null;
};

export const HistogramChart = ({
  histogramData,
  loading,
  metric,
  setMetric,
}) => {
  const bins = histogramData?.bins || [];
  const totalObservations = histogramData?.totalObservations || 0;

  return (
    <div className="card histogram-card">
      <div className="card-header chart-header-row">
        <div>
          <div className="chart-title-wrap">
            <BarChart2 size={18} className="text-primary" />
            <h3 className="card-title">Spatial Coordinate Distribution Histogram</h3>
          </div>
          <p className="card-subtitle">
            Backend-calculated frequency distribution of observations across spatial pixel bins
          </p>
        </div>

        <div className="metric-toggle-group">
          <button
            type="button"
            className={`btn-toggle ${metric === 'x' ? 'btn-toggle-active' : ''}`}
            onClick={() => setMetric('x')}
          >
            X (px) Distribution
          </button>
          <button
            type="button"
            className={`btn-toggle ${metric === 'y' ? 'btn-toggle-active' : ''}`}
            onClick={() => setMetric('y')}
          >
            Y (px) Distribution
          </button>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Computing histogram bins on server..." size={22} />
          </div>
        ) : bins.length === 0 ? (
          <div className="empty-chart-state">
            <p>No observations available to generate histogram bins for current filters.</p>
          </div>
        ) : (
          <div className="chart-container" style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bins}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="binLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Observation Count"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-summary-bar">
          <span>Active Metric: <strong>{metric === 'x' ? 'X Coordinate (px)' : 'Y Coordinate (px)'}</strong></span>
          <span>Sampled Count: <strong>{totalObservations.toLocaleString()} observations</strong></span>
          <span>Binned Intervals: <strong>{bins.length} discrete bins</strong></span>
        </div>
      </div>
    </div>
  );
};

export default HistogramChart;
