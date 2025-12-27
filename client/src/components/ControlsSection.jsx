import React from 'react';
import './ControlsSection.css';

function ControlsSection({ filters, onFilterChange }) {
  return (
    <div className="controls-section">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search by endpoint, IP, method..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>
      
      <div className="filter-controls">
        <select
          value={filters.method}
          onChange={(e) => onFilterChange('method', e.target.value)}
          className="filter-select"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="2xx">2xx Success</option>
          <option value="4xx">4xx Client Error</option>
          <option value="5xx">5xx Server Error</option>
        </select>
        
        <select
          value={filters.timeRange}
          onChange={(e) => onFilterChange('timeRange', e.target.value)}
          className="filter-select"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
    </div>
  );
}

export default ControlsSection;
