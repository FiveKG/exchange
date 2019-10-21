// @ts-check
const logger = require("../common/logger").getLogger("psExchange.js")
const getAmqpChannel = require("./amqp.js");
const { GET_ETH_ACC } = require("../common/constant/optConstants");

/**
 * 
 * @param {Object} data 
 */
async function publish(data) {
    try {
        let channel = await getAmqpChannel(GET_ETH_ACC);
        await channel.sendToQueue(GET_ETH_ACC, Buffer.from(JSON.stringify(data)));
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
        let channel = await getAmqpChannel(GET_ETH_ACC);
        channel.consume(GET_ETH_ACC, msg => {
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