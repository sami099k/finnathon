const ApiLog = require('../models/apiLog');
const Alert = require('../models/Alert');

// Get logs with filtering and pagination
exports.getLogs = async (req, res) => {
  try {
    const { timeRange = '24h', page = 1, limit = 100 } = req.query;
    
    // Calculate time filter
    const now = new Date();
    let startTime = new Date();
    
    switch(timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setHours(now.getHours() - 24);
    }

    const query = {
      timestamp: { $gte: startTime }
    };

    const logs = await ApiLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ApiLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const now = new Date();
    let startTime = new Date();
    
    switch(timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(now.getHours() - 6);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setHours(now.getHours() - 24);
    }

    const query = {
      timestamp: { $gte: startTime }
    };

    const totalHits = await ApiLog.countDocuments(query);
    
    const successfulRequests = await ApiLog.countDocuments({
      ...query,
      statusCode: { $gte: 200, $lt: 300 }
    });
    
    const failedRequests = await ApiLog.countDocuments({
      ...query,
      statusCode: { $gte: 400 }
    });

    const successRate = totalHits > 0 ? (successfulRequests / totalHits) * 100 : 0;

    // Calculate average response time
    const logs = await ApiLog.find(query).select('responseTimeMs');
    const totalResponseTime = logs.reduce((sum, log) => sum + (log.responseTimeMs || 0), 0);
    const avgResponseTime = logs.length > 0 ? totalResponseTime / logs.length : 0;

    res.json({
      success: true,
      stats: {
        totalHits,
        successRate: Math.round(successRate * 10) / 10,
        failedRequests,
        avgResponseTime: Math.round(avgResponseTime)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

// Get alerts
exports.getAlerts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};
