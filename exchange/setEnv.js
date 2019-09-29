// @ts-check
const config = require("./config");

function setEnv() {
  if (!process.env.CONSUL_URL) {
    process.env.CONSUL_URL = "http://localhost:7758";
  }

  if(!process.env.TBG_DB_HOST){
    process.env.TBG_DB_HOST = config.db.host ;
  }
  if(!process.env.TBG_DB_PORT){
      process.env.TBG_DB_PORT = config.db.port.toString();
  }
  if(!process.env.TBG_DB_USER){
      process.env.TBG_DB_USER = config.db.user;
  }
  if(!process.env.TBG_DB_PASS){
      process.env.TBG_DB_PASS = config.db.password;
  }
  if(!process.env.TBG_DB_NAME){
      process.env.TBG_DB_NAME = config.db.database;
  }
  if(!process.env.TBG_REDIS_HOST){
      process.env.TBG_REDIS_HOST = config.redis.host;
  }
  if(!process.env.TBG_REDIS_PORT){
      process.env.TBG_REDIS_PORT = config.redis.port.toString();
  }
  if(!process.env.TBG_REDIS_PASS){
      process.env.TBG_REDIS_PASS = config.redis.auth;
  }
  if(!process.env.RABBIT_PASS){
      process.env.RABBIT_PASS = config.rabbitmq.pwd;
  }
  if(!process.env.RABBIT_PORT){
      process.env.RABBIT_PORT = config.rabbitmq.port.toString();
  }
  if(!process.env.RABBIT_HOST){
      process.env.RABBIT_HOST = config.rabbitmq.host;
  }
  if(!process.env.RABBIT_USER){
      process.env.RABBIT_USER = config.rabbitmq.user;
  }
}

module.exports = setEnv;
