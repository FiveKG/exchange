// @ts-check
const express = require("express");
const router = express.Router();
const exchange = require('../controllers/exchange');
//获取历史交易记录
router.get("/exchange/history_exchange_records",exchange.history_exchange_records);
//获取某个详细交易记录
router.get("/exchange/get_record_detail",exchange.detail_record);

//检查余额并获取交易地址
router.post("/exchange/check_eth_account",exchange.check_eth_account);

//获取公审
router.get("/exchange/get_examine_data",exchange.get_examine_data);
//提交交易信息
router.post('/exchange/record_trx',exchange.record_charge);
router.post('/exchange/ue2usdt',exchange.ue2usdt)
module.exports = router