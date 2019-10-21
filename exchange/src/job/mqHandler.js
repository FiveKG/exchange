// @ts-check
const logger = require("../common/logger.js").getLogger("mqHandler.js")
const {psTransfer2Pog} = require("../db");
const transfer2Pog = require("./transfer2Pog");



// 写入Eth_charge 操作
//@ts-ignore
psTransfer2Pog.sub(async msg => {
    try {
        let result = JSON.parse(msg);
        await transfer2Pog(result);
    } catch (err) {
        throw err;
    }
})
