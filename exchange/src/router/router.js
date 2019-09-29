// @ts-check
const express = require("express");
const router = express.Router();

// 测试
router.get("/PAX", require("../controllers/exchange/PAX"));
// 测试
router.get("/test", require("../controllers/exchange/test"));
module.exports = router