// @ts-check
const logger = require("../common/logger.js").getLogger("mqHandler.js")
const {psTransfer2Pog,psTransfer2Eth} = require("../db");
const transfer2Pog = require("./transfer2Pog");
const transfer2Eth = require('./transfer2Eth')


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

psTransfer2Eth.sub(async msg => {
    try {
        let result = JSON.parse(msg);
        await transfer2Eth(result);
    } catch (err) {
        throw err;
    }
})
