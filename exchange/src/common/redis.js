// @ts-check
const Redis = require('ioredis');
const config = require("../../config.js");

const host = process.env.EXCHANGE_REDIS_HOST || config.redis.host;
const port = process.env.EXCHANGE_REDIS_PORT || config.redis.port;
const auth = process.env.EXCHANGE_REDIS_PASS || config.redis.auth;

const redis = new Redis(Number(port), host, { 
  "password": auth ,
  "showFriendlyErrorStack": true , 
  "db": 6,
  "keepAlive": 10000 , 
  "connectionName": "EXCHANGE" , 
  "autoResubscribe": true
});

module.exports = redis;