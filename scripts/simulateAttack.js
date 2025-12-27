const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEYS?.split(',')[0]?.trim() || 'demo-key';
const BAD_KEY = 'bad-key';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function floodBalance(count, key) {
  const headers = { 'x-api-key': key };
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(axios.get(`${BASE_URL}/api/balance`, { headers }).catch(() => {}));
  }
  await Promise.all(promises);
}

async function run() {
  console.log('Starting attack simulation: rapid requests + auth failures');
  await floodBalance(120, API_KEY); // trigger rate limit
  await wait(1000);
  for (let i = 0; i < 10; i++) {
    await axios.get(`${BASE_URL}/api/balance`, { headers: { 'x-api-key': BAD_KEY } }).catch(() => {});
    await wait(200);
  }
  console.log('Attack simulation complete');
}

run().catch((err) => {
  console.error('Attack simulation failed', err.response?.status, err.response?.data || err.message);
});
