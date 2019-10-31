//@ts-check
const {inspect_req_data,get_status} = require("../../common");
const logger  =require("../../common/logger").getLogger("detail_record.js");
const get_history = require("../../job/getHistory");
//@ts-ignore
async function history_exchange_records(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        logger.debug(`the param is:${JSON.stringify(reqData)}`)

        let resData = get_status(1);
        const result = await get_history(reqData.pog_account)
        resData["data"] = result
 
        res.send(resData);
    }catch(error){
        logger.error("request history_exchange_records error, the error stock is %O", error);
        throw error;
    }
}

module.exports = history_exchange_records