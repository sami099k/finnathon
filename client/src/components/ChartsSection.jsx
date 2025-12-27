import React, { useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './ChartsSection.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ChartsSection({ logs }) {
  // Prepare data for hits over time chart
  const hitsChartData = useMemo(() => {
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i));
      return hour.getHours();
    });

    const hitsByHour = new Array(24).fill(0);
    
    logs.forEach(log => {
      const logDate = new Date(log.timestamp || log.createdAt);
      const hoursDiff = Math.floor((new Date() - logDate) / (1000 * 60 * 60));
      if (hoursDiff < 24) {
        const index = 23 - hoursDiff;
        if (index >= 0 && index < 24) {
          hitsByHour[index]++;
        }
      }
    });

    return {
      labels: last24Hours.map(h => `${h}:00`),
      datasets: [
        {
          label: 'API Hits',
          data: hitsByHour,
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [logs]);

  // Prepare data for endpoint distribution chart
  const endpointChartData = useMemo(() => {
    const endpointCounts = {};
    
    logs.forEach(log => {
      const endpoint = log.endpoint || 'Unknown';
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });

    const sortedEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedEndpoints.map(([endpoint]) => endpoint),
      datasets: [
        {
          label: 'Requests',
          data: sortedEndpoints.map(([, count]) => count),
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(124, 58, 237, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgb(37, 99, 235)',
            'rgb(124, 58, 237)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [logs]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f1f5f9'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f1f5f9',
          padding: 15
        }
      }
    }
  };

  return (
    <div className="charts-section">
      <div className="chart-container">
        <h3>API Hits Over Time (Last 24 Hours)</h3>
        <div className="chart-wrapper">
          <Line data={hitsChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Top 5 Endpoints</h3>
        <div className="chart-wrapper">
          <Doughnut data={endpointChartData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default ChartsSection;
