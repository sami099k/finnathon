import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import ControlsSection from './components/ControlsSection';
import ChartsSection from './components/ChartsSection';
import TopEndpoints from './components/TopEndpoints';
import LogsTable from './components/LogsTable';
import AlertsSection from './components/AlertsSection';
import BlockedClients from './components/BlockedClients';
import LogModal from './components/LogModal';
import { fetchLogs, fetchStats, fetchAlerts, fetchBlocked, blockClient, unblockClient } from './services/api';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalHits: 0,
    successRate: 0,
    failedRequests: 0,
    avgResponseTime: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    method: '',
    status: '',
    timeRange: '24h'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const logsPerPage = 20;

  // Socket.io connection
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('newLog', (log) => {
      setLogs(prevLogs => [log, ...prevLogs]);
      setLastUpdate(new Date());
    });

    socket.on('newAlert', (alert) => {
      setAlerts(prevAlerts => [alert, ...prevAlerts]);
    });

    return () => socket.disconnect();
  }, []);

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, [filters.timeRange]);

  const loadData = async () => {
    try {
      const [logsData, statsData, alertsData, blockedData] = await Promise.all([
        fetchLogs(filters.timeRange),
        fetchStats(filters.timeRange),
        fetchAlerts(),
        fetchBlocked()
      ]);
      
      setLogs(logsData);
      setStats(statsData);
      setAlerts(alertsData);
      setBlocked(blockedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filter logs
  useEffect(() => {
    let filtered = [...logs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.endpoint?.toLowerCase().includes(searchLower) ||
        log.ip?.toLowerCase().includes(searchLower) ||
        log.method?.toLowerCase().includes(searchLower) ||
        log.userAgent?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.method) {
      filtered = filtered.filter(log => log.method === filters.method);
    }

    if (filters.status) {
      filtered = filtered.filter(log => {
        const statusCode = log.statusCode;
        if (filters.status === '2xx') return statusCode >= 200 && statusCode < 300;
        if (filters.status === '4xx') return statusCode >= 400 && statusCode < 500;
        if (filters.status === '5xx') return statusCode >= 500 && statusCode < 600;
        return true;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, filters]);

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  const handleBlock = async (clientId) => {
    try {
      await blockClient(clientId);
      const updated = await fetchBlocked();
      setBlocked(updated);
    } catch (error) {
      console.error('Error blocking client:', error);
    }
  };

  const handleUnblock = async (clientId) => {
    try {
      await unblockClient(clientId);
      setBlocked((prev) => prev.filter((c) => c !== clientId));
    } catch (error) {
      console.error('Error unblocking client:', error);
    }
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="dashboard-container">
      <Header
        onRefresh={handleRefresh}
        onExport={handleExport}
        lastUpdate={lastUpdate}
      />
      
      <div className="top-section">
        <ControlsSection
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <LogsTable
          logs={currentLogs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewLog={handleViewLog}
        />
      </div>
      
      <div className="stats-section">
        <StatsGrid stats={stats} />
      </div>
      
      <div className="analytics-section">
        <ChartsSection logs={logs} />
        
        <TopEndpoints logs={logs} />
        
        <AlertsSection alerts={alerts} />
        <BlockedClients
          blockedClients={blocked}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
        />
      </div>
      
      {selectedLog && (
        <LogModal log={selectedLog} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;
