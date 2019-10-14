// @ts-check
const logger = require("../common/logger").getLogger("psExchange.js")
const getAmqpChannel = require("./amqp.js");
const { EXCHANGE } = require("../common/constant/optConstants");

/**
 * 
 * @param {Object} data 
 */
async function publish(data) {
    try {
        let channel = await getAmqpChannel(EXCHANGE);
        await channel.sendToQueue(EXCHANGE, Buffer.from(JSON.stringify(data)));
    } catch (err) {
        throw err;
    }
}

async function subscribe(callback) {
    try {
        let channel = await getAmqpChannel(EXCHANGE);
        channel.consume(EXCHANGE, msg => {
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