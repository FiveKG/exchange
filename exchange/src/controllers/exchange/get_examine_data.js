// @ts-check
const {inspect_req_data,get_status} = require("../../common")
const logger  =require("../../common/logger").getLogger("get_examine_data.js")
const {getAllAddressBalance} = require("../../job/getEthTrxAction")

//@ts-ignore
async function get_examine_data(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        logger.debug(`the param is:${JSON.stringify(reqData)}`)
        

        let resData = get_status(1);
        const examine_data = await getAllAddressBalance()
        resData["data"] = examine_data;
        res.send(resData);
    }catch(error){
        logger.error("request get_examine_data error, the error stock is %O", error);
        throw error;
    }
}

module.exports = get_examine_data