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

const innerConfig = new InnerConfig(option);

module.exports = innerConfig;