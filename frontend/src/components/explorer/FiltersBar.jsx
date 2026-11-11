import React from 'react';
import { Filter, RotateCcw, Calendar, Truck } from 'lucide-react';

export const FiltersBar = ({
  vehicleClass,
  setVehicleClass,
  fromTime,
  setFromTime,
  toTime,
  setToTime,
  onReset,
  availableClasses = ['car', 'truck', 'bus', 'motorcycle', 'van', 'bicycle', 'pedestrian'],
}) => {
  const hasActiveFilters = Boolean(vehicleClass || fromTime || toTime);

  return (
    <div className="filters-card">
      <div className="filters-header">
        <div className="filters-title-wrap">
          <Filter size={16} className="text-primary" />
          <span className="filters-title">Filter Records & Analytics</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-reset-filters"
            onClick={onReset}
          >
            <RotateCcw size={14} />
            <span>Reset Active Filters</span>
          </button>
        )}
      </div>

      <div className="filters-row">
        {/* Vehicle Class Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Truck size={14} />
            <span>Vehicle Class</span>
          </label>
          <select
            className="form-control select-control"
            value={vehicleClass}
            onChange={(e) => setVehicleClass(e.target.value)}
          >
            <option value="">All Vehicle Classes</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls.charAt(0).toUpperCase() + cls.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* From Time Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={14} />
            <span>From Time</span>
          </label>
          <input
            type="datetime-local"
            className="form-control"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
        </div>

        {/* To Time Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={14} />
            <span>To Time</span>
          </label>
          <input
            type="datetime-local"
            className="form-control"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;

