//@ts-check
const InnerConfig = require("@yz/inner_config");

const config = require("../../config.js");

const host = process.env.EXCHANGE_REDIS_HOST || config.redis.host;
const port = process.env.EXCHANGE_REDIS_PORT || config.redis.port;
const auth = process.env.EXCHANGE_REDIS_PASS || config.redis.auth;

const option = {
     "host"    : "172.19.2.22",//hxTJ4jsl+9mvx+tAgw==
//"192.168.1.115",//172.19.2.22
     "port"    : 6379 ,
     "password": "hxTJ4jsl+9mvx+tAgw=="
 }
console.log('=====redis++====',option)
const innerConfig = new InnerConfig(option);

module.exports = innerConfig;
