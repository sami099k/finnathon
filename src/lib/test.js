// testRedis.js
require('dotenv').config();
const Redis = require('ioredis');

const url = process.env.REDIS_URL;
if (!url) {
  console.error('REDIS_URL not set in .env');
  process.exit(2);
}

// try with normal options first
async function tryConnect(optsDesc, opts) {
  console.log('Trying connection with:', optsDesc);
  const client = new Redis(url, opts);
  client.on('error', e => console.error('ioredis ERROR event:', e.message || e));
  client.on('ready', () => console.log('ioredis READY event'));

  try {
    const pong = await client.ping();
    console.log('PING ->', pong);
  } catch (err) {
    console.error('connect failed:', err && err.message ? err.message : err);
  } finally {
    try { await client.quit(); } catch(_) {}
  }
}

(async () => {
  // 1) default
  await tryConnect('default (no tls override)', { maxRetriesPerRequest: null });

  // 2) try forcing TLS (useful if server expects TLS)
  await tryConnect('force tls; rejectUnauthorized=false (debug only)', {
    maxRetriesPerRequest: null,
    tls: { rejectUnauthorized: false }
  });

  // 3) try disabling TLS (useful if provider gave redis:// but client forced TLS)
  await tryConnect('no tls (plain)', { maxRetriesPerRequest: null, tls: undefined });

  process.exit(0);
})();
