import React from 'react';
import './LogModal.css';

function LogModal({ log, onClose }) {
  if (!log) return null;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Log Details</h2>
        
        <div className="log-details-content">
          <div className="detail-section">
            <h3>Request Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Timestamp:</strong>
                <span>{formatTimestamp(log.timestamp || log.createdAt)}</span>
              </div>
              <div className="detail-item">
                <strong>Method:</strong>
                <span className={`method-badge method-${log.method}`}>{log.method}</span>
              </div>
              <div className="detail-item">
                <strong>Endpoint:</strong>
                <span>{log.endpoint}</span>
              </div>
              <div className="detail-item">
                <strong>Status Code:</strong>
                <span className={`status-badge status-${Math.floor(log.statusCode / 100)}xx`}>
                  {log.statusCode}
                </span>
              </div>
              <div className="detail-item">
                <strong>Response Time:</strong>
                <span>{log.responseTime ? `${log.responseTime}ms` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Client Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>IP Address:</strong>
                <span>{log.ip || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <strong>User Agent:</strong>
                <span>{log.userAgent || 'N/A'}</span>
              </div>
            </div>
          </div>

          {log.requestBody && (
            <div className="detail-section">
              <h3>Request Body</h3>
              <pre>{JSON.stringify(log.requestBody, null, 2)}</pre>
            </div>
          )}

          {log.responseBody && (
            <div className="detail-section">
              <h3>Response Body</h3>
              <pre>{JSON.stringify(log.responseBody, null, 2)}</pre>
            </div>
          )}

          {log.error && (
            <div className="detail-section error-section">
              <h3>Error Details</h3>
              <pre>{typeof log.error === 'string' ? log.error : JSON.stringify(log.error, null, 2)}</pre>
            </div>
          )}

          {log.headers && (
            <div className="detail-section">
              <h3>Headers</h3>
              <pre>{JSON.stringify(log.headers, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogModal;
