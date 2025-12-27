const { createClient } = require("redis");

const redis = createClient({
  url: "redis://default:75XGOvCf4qcd4DirQOCzhSPn8bULKWMc@redis-18134.crce182.ap-south-1-1.ec2.cloud.redislabs.com:18134"
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

redis.connect();

module.exports = redis;