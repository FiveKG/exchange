// @ts-check
const logger = require("../common/logger.js").getLogger("mqHandler.js")
const {psTransfer2Pog,psTransfer2Eth,psServiceCharge} = require("../db");
const transfer2Pog = require("./transfer2Pog");
const transfer2Eth = require('./transfer2Eth')
const transfer2Charge = require("./transfer2Charge")
const sleep = require("./sleep")

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

//@ts-ignore
psTransfer2Eth.sub(async msg => {
    try {
        let result = JSON.parse(msg);
	logger.debug("psTransfer2Eth  result: ", JSON.stringify(result, null, 4));
	await sleep(200);
        await transfer2Eth(result);
    } catch (err) {
        throw err;
    }
})


//@ts-ignore
psServiceCharge.sub(async msg => {
    try {
        let result = JSON.parse(msg);
        await transfer2Charge(result);
    } catch (err) {
        throw err;
    }
})
