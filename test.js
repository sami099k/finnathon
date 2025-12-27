// tryRedisBoth.js
require('dotenv').config();
const Redis = require('ioredis');
const urlOrig = process.env.REDIS_URL;

if (!urlOrig) {
  console.error('REDIS_URL missing in .env — set it to the host:port form (you can mask password).');
  process.exit(2);
}

function swapScheme(url, scheme) {
  // replace leading scheme (redis:// or rediss://) with desired one
  return url.replace(/^redis(s)?:\/\//, scheme + '://');
}

async function tryOne(desc, url, opts = {}) {
  console.log('---');
  console.log('Trying:', desc, url);
  const client = new Redis(url, Object.assign({ maxRetriesPerRequest: 1 }, opts));
  client.on('error', e => console.error('ioredis ERROR event:', e && e.message ? e.message : e));
  try {
    const pong = await client.ping();
    console.log('PING ->', pong);
    await client.quit();
    return true;
  } catch (err) {
    console.error('connect failed:', err && err.message ? err.message : err);
    try { await client.quit(); } catch(_) {}
    return false;
  }
}

(async () => {
  // 1) try the original URL as-is
  await tryOne('original', urlOrig);

  // 2) try forcing non-TLS (redis://)
  const urlNonTls = swapScheme(urlOrig, 'redis');
  await tryOne('force non-TLS (redis://)', urlNonTls);

  // 3) try forcing TLS (rediss://) with relaxed cert check for debugging
  const urlTls = swapScheme(urlOrig, 'rediss');
  await tryOne('force TLS (rediss://) with rejectUnauthorized=false', urlTls, { tls: { rejectUnauthorized: false } });

  console.log('Done tests. Use the variant that returned PONG.');
  process.exit(0);
})();
