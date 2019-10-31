// @ts-check
require("./setEnv.js")();
const express = require('express');
const logger = require("./src/common/logger").getLogger('exchange.js')
const app = express();
const nginx_host = `127.0.0.1`;
const {sequelize} = require('./src/db')

logger.info(`init server of pools server.`)
app.set("x-powered-by", false);//“ X-Powered-By”是常见的非标准HTTP响应标头，设置为false


//设置响应头中间件
app.use(function (req, res, next) {
  logger.info(`${req.method} ${req.path}`);
  res.set({
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Headers': "Content-Type,token,req_id,client_id,lang"
  });
  if (req.method == 'OPTIONS') {
    return res.end();
  }
  next();
});

app.set('trust proxy', function (ip) {
  //除非 trust proxy 设置正确，否则应用会误将代理服务器的 IP 地址注册为客户端 IP 地址。
  //http://www.expressjs.com.cn/guide/behind-proxies.html
  if (!nginx_host) {
    return false; //未设置，就认为当前程序直接面对互联网。
  } else {
    return ip === nginx_host;
  }
});

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(require("./src/router/router"));

let port = process.env.EXCHANGE_SERVER_PORT || 7758 // = sb.get_config("service_port", `${service_name}`);
let host = process.env.EXCHANGE_SERVER_HOST || "0.0.0.0"
const server = module.exports = app.listen(Number(port), host);

server.on('listening', async () => {
  // require("@yz/yue-service-register")(`${service_name}`, port);
  // 初始化系统服务数据;


  sequelize.sequelize.sync().then(function(result){
    // 同步数据库
    logger.info('数据库同步成功')
    
    }).catch(error=>{
      logger.error(`the error from sequelize.sync(),the erroe:${error}`)
    })
 
  logger.warn(`**** server of pools running at http://${host}:${port}/  ****`)
}); 

server.on("close", () => {
  logger.warn(`**** server of pools listening on ${port} stopped ****`);
});

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  logger.error('unhandledRejection', error.message);
});
module.exports = app;
