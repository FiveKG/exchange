// @ts-check
const logger = require("../common/logger").getLogger("psServiceCharge.js")
const getAmqpChannel = require("./amqp.js");
const { HANDLE_TRANSFER2CHARGE } = require("../common/constant/optConstants");

/**
 * 
 * @param {Object} data 
 */
async function publish(data) {
    try {
        let channel = await getAmqpChannel(HANDLE_TRANSFER2CHARGE);
        await channel.sendToQueue(HANDLE_TRANSFER2CHARGE, Buffer.from(JSON.stringify(data)));
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
        let channel = await getAmqpChannel(HANDLE_TRANSFER2CHARGE);
        channel.consume(HANDLE_TRANSFER2CHARGE  , msg => {
            // logger.debug("game message: ", msg);
            if (msg !== null) {
                channel.ack(msg);
                callback(msg.content.toString());
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