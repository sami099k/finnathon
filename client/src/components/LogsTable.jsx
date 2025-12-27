import React from 'react';
import './LogsTable.css';

function LogsTable({ logs, currentPage, totalPages, onPageChange, onViewLog }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMethodClass = (method) => {
    return `method-badge method-${method}`;
  };

  const getStatusClass = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'status-badge status-2xx';
    if (statusCode >= 400 && statusCode < 500) return 'status-badge status-4xx';
    if (statusCode >= 500) return 'status-badge status-5xx';
    return 'status-badge';
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="section">
      <h2>Live API Logs</h2>
      <div className="table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th className="col-timestamp">TIMESTAMP</th>
              <th className="col-method">METHOD</th>
              <th className="col-endpoint">ENDPOINT</th>
              <th className="col-status">STATUS</th>
              <th className="col-response">RESPONSE TIME</th>
              <th className="col-ip">IP ADDRESS</th>
              <th className="col-agent">USER AGENT</th>
              <th className="col-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No logs available</td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log._id || index}>
                  <td className="col-timestamp">{formatTimestamp(log.timestamp || log.createdAt)}</td>
                  <td className="col-method">
                    <span className={getMethodClass(log.method)}>
                      {log.method}
                    </span>
                  </td>
                  <td className="col-endpoint" title={log.endpoint}>{truncateText(log.endpoint, 30)}</td>
                  <td className="col-status">
                    <span className={getStatusClass(log.statusCode)}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="col-response">{log.responseTimeMs ? `${log.responseTimeMs.toFixed(2)}ms` : 'N/A'}</td>
                  <td className="col-ip">{log.clientIp || log.ip || 'N/A'}</td>
                  <td className="col-agent" title={log.userAgent}>{truncateText(log.userAgent, 25)}</td>
                  <td className="col-actions">
                    <button
                      className="btn-view"
                      onClick={() => onViewLog(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages || 1}</span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default LogsTable;
