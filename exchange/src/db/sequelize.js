//@ts-check
const Sequelize = require('sequelize');
const { db } = require("../../config.js");
const createTable = require('./createTable')

const database = process.env.EXCHANGE_DB_NAME || db.database;
const user = process.env.EXCHANGE_DB_USER || db.user;
const password = process.env.EXCHANGE_DB_PWD || db.password;
const port = process.env.EXCHANGE_DB_PORT ||db.port;
const host = process.env.EXCHANGE_DB_host ||db.host;
const logger = require('../common/logger').getLogger("sequelize.js")
//方法1:单独传递参数
//@ts-ignore
const sequelize = new Sequelize(database,user, password, {
  host:host,
  port:port,
  protocol: null,
  define: {
    underscored: false,
    freezeTableName: false,
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci'
    },
    timestamps: true
  },
  logging: false,
  dialect:'mysql', /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' 之一 */
  pool: {
    max: 20, // 连接池中最大连接数量
    min: 0, // 连接池中最小连接数量
    acquire: 30000,//出错之后再次连接的最长时间
    idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
    }
});
const {Eth_tax,Eth_charge} = createTable(sequelize,Sequelize)

module.exports = {
  "sequelize" : sequelize,
  "Eth_tax": Eth_tax,
  "Eth_charge": Eth_charge
};