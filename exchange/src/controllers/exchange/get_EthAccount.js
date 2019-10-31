// @ts-check
const {inspect_req_data,get_status} = require("../../common")
const logger  =require("../../common/logger").getLogger("get_EthAccount.js")
const get_account = require("../../job/getNewEthAccount")

//@ts-ignore
async function get_EthAccount(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        logger.debug(`the param is:${JSON.stringify(reqData)}`)

        //psGetPAXAccount.pub(reqData)
        let resData = get_status(1);
        const Eth_account = await get_account(reqData.account_name)
        resData["data"] = {
            Eth_account : Eth_account
        }
 
         res.send(resData);
    }catch(error){
        logger.error("request get_EthAccount error, the error stock is %O", error);
        throw error;
    }
}

module.exports = get_EthAccount