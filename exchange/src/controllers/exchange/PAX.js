// @ts-check
const logger = require("../../common/logger").getLogger('PAX.js')
async function test(req,res,next){
    console.log('testing');
    logger.debug('testing')
    res.send('comming...');
}

module.exports = test