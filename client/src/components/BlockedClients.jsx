import React, { useState } from 'react';
import './BlockedClients.css';

function BlockedClients({ blockedClients, onBlock, onUnblock }) {
  const [clientInput, setClientInput] = useState('');

  const handleBlock = () => {
    const value = clientInput.trim();
    if (!value) return;
    onBlock(value);
    setClientInput('');
  };

  return (
    <div className="section">
      <div className="blocked-header">
        <h2>Blocked Clients</h2>
        <div className="block-form">
          <input
            type="text"
            placeholder="Block IP or token"
            value={clientInput}
            onChange={(e) => setClientInput(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleBlock}>Block</button>
        </div>
      </div>
      {blockedClients.length === 0 ? (
        <div className="no-blocked">No clients are blocked</div>
      ) : (
        <div className="blocked-list">
          {blockedClients.map((client) => (
            <div key={client} className="blocked-item">
              <span>{client}</span>
              <button className="btn-view" onClick={() => onUnblock(client)}>Unblock</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlockedClients;
