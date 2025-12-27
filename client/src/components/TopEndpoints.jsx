import React, { useMemo } from 'react';
import './TopEndpoints.css';

function TopEndpoints({ logs }) {
  const topEndpoints = useMemo(() => {
    const endpointStats = {};
    
    logs.forEach(log => {
      const endpoint = log.endpoint || 'Unknown';
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = {
          count: 0,
          totalTime: 0,
          errors: 0
        };
      }
      
      endpointStats[endpoint].count++;
      endpointStats[endpoint].totalTime += log.responseTime || 0;
      if (log.statusCode >= 400) {
        endpointStats[endpoint].errors++;
      }
    });

    return Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgTime: stats.count > 0 ? (stats.totalTime / stats.count).toFixed(0) : 0,
        errorRate: stats.count > 0 ? ((stats.errors / stats.count) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  return (
    <div className="section">
      <h2>Top Endpoints</h2>
      <div className="endpoints-grid">
        {topEndpoints.map((endpoint, index) => (
          <div key={index} className="endpoint-card">
            <h4>{endpoint.endpoint}</h4>
            <div className="endpoint-stats">
              <span>Hits: <strong>{endpoint.count}</strong></span>
              <span>Avg Time: <strong>{endpoint.avgTime}ms</strong></span>
              <span>Error Rate: <strong>{endpoint.errorRate}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopEndpoints;
