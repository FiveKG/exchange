// @ts-check
const logger = require("../../common/logger").getLogger('TEST.js')
async function test(req,res,next){
    console.log('testing');
    logger.warn('testing2')
    res.send('comming...');
}

module.exports = test