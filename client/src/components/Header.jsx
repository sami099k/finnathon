import React from 'react';
import './Header.css';

function Header({ onRefresh, onExport, lastUpdate }) {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="dashboard-header">
      <h1>API Monitoring Dashboard</h1>
      <div className="header-controls">
        <button onClick={onRefresh} className="btn btn-primary">
          Refresh
        </button>
        <button onClick={onExport} className="btn btn-secondary">
          Export
        </button>
        <span className="last-updated">
          Last Updated: <span>{formatTime(lastUpdate)}</span>
        </span>
      </div>
    </header>
  );
}

export default Header;
