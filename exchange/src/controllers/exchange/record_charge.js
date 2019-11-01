//@ts-check
const {inspect_req_data,get_status} = require("../../common");
const logger  =require("../../common/logger").getLogger("record_charge.js");
const recordTransfer = require("../../job/recordTransfer");
//@ts-ignore
async function record_charge(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        logger.debug(`the param is:${JSON.stringify(reqData)}`)
        const data = {
            pog_account:reqData.pog_account,
            trx_id:reqData.trx_id,
            transfer_from_address:reqData.transfer_from_address,
            transfer_to_address:reqData.transfer_to_address,
            transfer_amount:reqData.transfer_amount
        }
        
        const result = await recordTransfer(data);

        let resData = get_status(1);
        if(result==500){
            resData = get_status(500);
        }else if(result ==2000){
            resData = get_status(2000);
        }
       
        res.send(resData);
    }catch(error){
        let resData = get_status(500);
        res.send(resData);
        logger.error("request history_exchange_records error, the error stock is %O", error);
        throw error;
    }
}

module.exports = record_charge