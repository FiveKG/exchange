// @ts-check
const express = require("express");
const router = express.Router();

// 测试
router.get("/get_eth_account", require("../controllers/exchange/get_EthAccount"));
router.get("/history_exchange_records",require("../controllers/exchange/history_exchange_records"));
router.get("/get_record_detail",require("../controllers/exchange/detail_record"))
module.exports = router