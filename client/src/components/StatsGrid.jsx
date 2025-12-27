import React from 'react';
import './StatsGrid.css';

function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <h3>Total API Hits</h3>
          <p className="stat-value">{stats.totalHits.toLocaleString()}</p>
          <span className="stat-change positive">+12% from yesterday</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">✓</div>
        <div className="stat-content">
          <h3>Success Rate</h3>
          <p className="stat-value">{stats.successRate.toFixed(1)}%</p>
          <span className="stat-change positive">+2.5%</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">!</div>
        <div className="stat-content">
          <h3>Failed Requests</h3>
          <p className="stat-value">{stats.failedRequests.toLocaleString()}</p>
          <span className="stat-change negative">-5%</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">⏱</div>
        <div className="stat-content">
          <h3>Avg Response Time</h3>
          <p className="stat-value">{stats.avgResponseTime.toFixed(0)}ms</p>
          <span className="stat-change positive">-15ms</span>
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;
