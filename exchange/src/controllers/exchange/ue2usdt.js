//@ts-check
const {inspect_req_data,get_status} = require("../../common");
const logger  =require("../../common/logger").getLogger("ue2usdt.js");
const recordUe2Usdt = require("../../job/recordUe2Usdt");
//@ts-ignore
async function ue2usdt(req,res,next){
    try{
        let reqData = await inspect_req_data(req);
        
        logger.debug(`the param is:${JSON.stringify(reqData)}`)
        const data = {
            block_number:reqData.block_number,
            pog_account:reqData.pog_account,
            trx_id:reqData.trx_id,
            transfer_amount:reqData.transfer_amount
        }
        console.log(data)
        const result = await recordUe2Usdt(data);

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
        logger.error("request ue2usdt error, the error stock is %O", error);
        throw error;
    }
}

module.exports = ue2usdt