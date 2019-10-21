// @ts-check
const express = require("express");
const router = express.Router();

// 测试
router.get("/get_eth_account", require("../controllers/exchange/get_EthAccount"));

module.exports = router