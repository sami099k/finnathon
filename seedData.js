const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const ApiLog = require('./src/models/apiLog');
const Alert = require('./src/models/Alert');

const ENDPOINTS = [
  '/api/balance',
  '/api/transaction',
  '/api/history',
  '/api/health',
  '/api/account',
  '/api/transfer',
  '/api/payment',
  '/api/withdraw',
  '/api/deposit'
];

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const IP_ADDRESSES = [
  '192.168.1.100',
  '192.168.1.101',
  '192.168.1.102',
  '10.0.0.1',
  '10.0.0.2',
  '172.16.0.1',
  '203.0.113.45',
  '198.51.100.89'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'PostmanRuntime/7.26.8',
  'curl/7.64.1'
];

function generateRandomStatusCode() {
  const rand = Math.random();
  if (rand < 0.85) return 200 + Math.floor(Math.random() * 5); // 200-204 (85%)
  if (rand < 0.95) return 400 + Math.floor(Math.random() * 8); // 400-407 (10%)
  return 500 + Math.floor(Math.random() * 5); // 500-504 (5%)
}

function generateResponseTime() {
  return Math.floor(Math.random() * 2000) + 10; // 10-2010ms
}

function generateDummyLog(index) {
  const statusCode = generateRandomStatusCode();
  const responseTime = generateResponseTime();
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 1440); // Last 24 hours

  const timestamp = new Date(now.getTime() - minutesAgo * 60000);

  return {
    timestamp,
    clientIp: IP_ADDRESSES[Math.floor(Math.random() * IP_ADDRESSES.length)],
    endpoint: ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)],
    method: METHODS[Math.floor(Math.random() * METHODS.length)],
    statusCode,
    responseTimeMs: responseTime,
    userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    apiToken: `token_${Math.random().toString(36).substring(7)}`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function generateDummyAlert(index) {
  const alertTypes = ['HIGH_LATENCY', 'HIGH_ERROR_RATE', 'UNUSUAL_TRAFFIC', 'RATE_LIMIT', 'SECURITY_ALERT'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const messages = [
    'Multiple failed authentication attempts detected',
    'Response time exceeds threshold',
    'Unusual traffic spike detected',
    'Rate limit exceeded for endpoint',
    'Potential DDoS attack detected',
    'High error rate on /api/transaction',
    'Database connection timeout',
    'Memory usage critical'
  ];

  const severity = severities[Math.floor(Math.random() * severities.length)];
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 1440);
  const timestamp = new Date(now.getTime() - minutesAgo * 60000);

  return {
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity,
    message: messages[Math.floor(Math.random() * messages.length)],
    description: `Alert generated at ${timestamp.toISOString()}`,
    timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    resolved: Math.random() > 0.7 // 30% resolved
  };
}

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('❌ MONGODB_URI not provided in .env file');
      console.log('Please add a valid MongoDB connection string to proceed with seeding');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing logs and alerts...');
    await ApiLog.deleteMany({});
    await Alert.deleteMany({});
    console.log('✅ Cleared existing data');

    // Generate and insert dummy logs
    console.log('📝 Generating 200 dummy API logs...');
    const dummyLogs = Array.from({ length: 200 }, (_, i) => generateDummyLog(i));
    const insertedLogs = await ApiLog.insertMany(dummyLogs);
    console.log(`✅ Inserted ${insertedLogs.length} logs`);

    // Generate and insert dummy alerts
    console.log('🚨 Generating 50 dummy alerts...');
    const dummyAlerts = Array.from({ length: 50 }, (_, i) => generateDummyAlert(i));
    const insertedAlerts = await Alert.insertMany(dummyAlerts);
    console.log(`✅ Inserted ${insertedAlerts.length} alerts`);

    // Generate statistics
    const logStats = await ApiLog.aggregate([
      {
        $facet: {
          totalLogs: [{ $count: 'count' }],
          successRate: [
            { $match: { statusCode: { $gte: 200, $lt: 300 } } },
            { $count: 'count' }
          ],
          failureRate: [
            { $match: { statusCode: { $gte: 400 } } },
            { $count: 'count' }
          ],
          avgResponseTime: [
            { $group: { _id: null, avg: { $avg: '$responseTimeMs' } } }
          ]
        }
      }
    ]);

    console.log('\n📊 Database Statistics:');
    console.log(`   Total Logs: ${logStats[0].totalLogs[0]?.count || 0}`);
    console.log(`   Successful Requests: ${logStats[0].successRate[0]?.count || 0}`);
    console.log(`   Failed Requests: ${logStats[0].failureRate[0]?.count || 0}`);
    console.log(`   Avg Response Time: ${Math.round(logStats[0].avgResponseTime[0]?.avg || 0)}ms`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('🎉 Your dashboard now has dummy data to display');
    console.log('\nRun: npm run dev');
    console.log('Then visit: http://localhost:3000\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
