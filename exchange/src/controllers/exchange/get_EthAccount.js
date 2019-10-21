// @ts-check
const {inspect_req_data,get_status} = require("../../common")
const logger  =require("../../common/logger").getLogger("get_PAXAccount.js")
const get_account = require("../../job/getNewPaxAccount")
const psGetPAXAccount = require("../../db/psGetPAXAccount")
//@ts-ignore
async function getPAXForPOG(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        logger.debug(`the param is:${JSON.stringify(reqData)}`)

        //psGetPAXAccount.pub(reqData)
        let resData = get_status(1);
        const num = await get_account(reqData.account_name)
        resData["data"] = {
            num : num
        }
 
         res.send(resData);
    }catch(error){
        logger.error("request get_banker error, the error stock is %O", error);
        throw error;
    }
}

module.exports = getPAXForPOG