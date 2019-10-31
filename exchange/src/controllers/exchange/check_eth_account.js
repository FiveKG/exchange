//@ts-check
const {inspect_req_data,get_status} = require("../../common");
const check_account = require('../../job/checkEthAccount')
const logger  =require("../../common/logger").getLogger("check_eth_account.js");
//@ts-ignore
async function check_eth_account(req,res,next){
    try{    
        let reqData = await inspect_req_data(req);
        let resData
        logger.debug(`the param is:${JSON.stringify(reqData)}`)

        
        const {transfer_from_address,transfer_amount} = reqData
        const result = await check_account(transfer_from_address,transfer_amount);
        if(!result){
            resData = get_status(2000, "错误值");
            res.send(resData);
            return
        }

        resData = get_status(1);
        resData['data'] =  result
        res.send(resData); 
    }catch(error){
        logger.error("request check_eth_account error, the error stock is %O", error);
        throw error;
    }
}

module.exports = check_eth_account;