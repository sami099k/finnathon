import React from 'react';
import './AlertsSection.css';

function AlertsSection({ alerts }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getAlertClass = (severity = '') => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return 'alert-item critical';
    if (s === 'medium') return 'alert-item medium';
    return 'alert-item';
  };

  return (
    <div className="section">
      <h2>Recent Alerts</h2>
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">No recent alerts</div>
        ) : (
          alerts.slice(0, 10).map((alert, index) => (
            <div key={alert._id || index} className={getAlertClass(alert.severity)}>
              <div className="alert-content">
                <h4>{alert.violationType || 'Alert'}</h4>
                <p>{alert.message || alert.description || alert?.details?.reason}</p>
              </div>
              <div className="alert-time">
                {formatTimestamp(alert.timestamp || alert.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsSection;
