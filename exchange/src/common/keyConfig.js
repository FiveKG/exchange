//@ts-check
const InnerConfig = require("@yz/inner_config");

const config = require("../../config.js");

const host = process.env.EXCHANGE_REDIS_HOST || config.redis.host;
const port = process.env.EXCHANGE_REDIS_PORT || config.redis.port;
const auth = process.env.EXCHANGE_REDIS_PASS || config.redis.auth;

const option = {
    "host"    : host,
    "port"    : Number(port),
    "password": auth
};
// const option = {
//     "host"    : "192.168.1.115",//172.19.2.22
//     "port"    : 6379 ,
//     "password": "redis_pass_2018"  //hxTJ4jsl+9mvx+tAgw==
// }
const innerConfig = new InnerConfig(option);

module.exports = innerConfig;