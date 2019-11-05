// @ts-check
const logger = require("../common/logger").getLogger("psTransfer2Eth.js")
const getAmqpChannel = require("./amqp.js");
const { HANDLE_TRANSFER2ETH } = require("../common/constant/optConstants");

/**
 * 
 * @param {Object} data 
 */
async function publish(data) {
    try {
        let channel = await getAmqpChannel(HANDLE_TRANSFER2ETH);
        await channel.sendToQueue(HANDLE_TRANSFER2ETH, Buffer.from(JSON.stringify(data)));
    } catch (err) {
        throw err;
    }
}

/**
 * 
 * @param {*} callback 
 */
async function subscribe(callback) {
    try {
        let channel = await getAmqpChannel(HANDLE_TRANSFER2ETH);
        channel.consume(HANDLE_TRANSFER2ETH  , msg => {
            // logger.debug("game message: ", msg);
            if (msg !== null) {
                callback(msg.content.toString());
                channel.ack(msg);
            }
        });
    } catch (err) {
        throw err;
    }
}

module.exports = {
    "pub": publish,
    "sub": subscribe
};