const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEYS?.split(',')[0]?.trim() || 'demo-key';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function hitBalance() {
  await axios.get(`${BASE_URL}/api/balance`, { headers: { 'x-api-key': API_KEY } });
}

async function postTransaction() {
  await axios.post(`${BASE_URL}/api/transaction`, {
    type: 'credit',
    amount: Math.floor(Math.random() * 50) + 1,
    reference: 'normal-sim'
  }, { headers: { 'x-api-key': API_KEY } });
}

async function fetchHistory() {
  await axios.get(`${BASE_URL}/api/history`, { headers: { 'x-api-key': API_KEY } });
}

async function run() {
  console.log('Starting normal traffic simulation');
  for (let i = 0; i < 20; i++) {
    await hitBalance();
    await wait(300 + Math.random() * 300);
    await postTransaction();
    await wait(300 + Math.random() * 300);
    await fetchHistory();
    await wait(500 + Math.random() * 500);
  }
  console.log('Normal simulation complete');
}

run().catch((err) => {
  console.error('Normal simulation failed', err.response?.status, err.response?.data || err.message);
});
