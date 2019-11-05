//@ts-check
const logger = require("../common/logger.js").getLogger("recordUe2Usdt.js");
const {HOT_ADDRESS} =require("../common/constant/web3Config");
const {UE2USDT_RATE,UE2USDT_TAX,BASE_CASH} = require("../common/constant/exchange_rule")
const {Decimal} = require('decimal.js');
const { generate_unique_key } = require("../common");
const {sequelize} = require('../db');

/**
 * 
 * @param {{
 * block_number         : Number,
 * pog_account          : String,
 * trx_id               : String,
 * transfer_amount      : String
 * }} transfer_data 
 */
async function recordUe2Usdt(transfer_data){
    try{
        const {block_number,the_pog_account,trx_id,transfer_amount}  = await analysisData(transfer_data);
        if(!block_number||!the_pog_account||!trx_id||!transfer_amount){
            console.log('数据不符合要求',block_number,the_pog_account,trx_id,transfer_amount);
            return 2000
        }
        let db_data = {
            id              : await generate_unique_key(),
            pog_txid        : trx_id,
            from_eth_address: HOT_ADDRESS,
            ue_value        : transfer_amount,
            usdt_value      : transfer_amount.sub(UE2USDT_TAX.split(" ")[0]),
            recharge_time   : new Date(),
            is_exchanged    : false,
            pog_account     : the_pog_account,
            pog_blockNumber : block_number,
            pog_confirm_blockNumber:parseInt(block_number+6),
            service_charge  : UE2USDT_TAX,
            exchange_rate   : UE2USDT_RATE,
            log_info        : 'UE2USDT'
        }
        
        //插入数据库
        try{
            const result = await sequelize.Eth_charge.create(db_data);
            return 1
        }catch(err){
            logger.error('err from recordTransfer() to insert db error,ths track is %O:',err);
            return 500
        }
        
    }catch(err){
        logger.error('err from recordTransfer(),ths track is %O:',err);
        throw err
    }
}

/**
 * 
 * @param {{
 *    block_number         : Number,
    * pog_account          : String,
    * trx_id               : String,
    * transfer_amount      : String
    * }} transfer_data 
*  @returns {Promise<Object>} 
    */
async function analysisData(transfer_data){
    try{
        /**
         * @type {{
         * block_number       : Number|null,
         * the_pog_account    : String|null,
         * trx_id             : String|null,
         * transfer_amount    : Decimal|String
         * }}
         */
        const data = {
            block_number         : null,
            the_pog_account      : null,
            trx_id               : null,
            transfer_amount      : ''
        }
        if(!transfer_data.block_number){
            logger.debug('wrong block_number from analysisData(),block_number:',transfer_data.block_number)
            return data
        }
        data.block_number=transfer_data.block_number
        //pog_account
        if(!transfer_data.pog_account){
            logger.debug('wrong pog_account from analysisData(),pog_account:',transfer_data.pog_account)
            return data
        }
        data.the_pog_account = transfer_data.pog_account;

        //trx_id
        if(!transfer_data.trx_id){
            logger.debug('wrong trx_id from analysisData(),trx_id',transfer_data.trx_id)
            return data
        }
        data.trx_id = transfer_data.trx_id;

        //transfer_amount
        if(parseInt(transfer_data.transfer_amount).toString() == "NaN"){
            logger.debug('wrong transfer_amount from analysisData(),is a NAN,transfer_amount:',transfer_data.transfer_amount);
            return data
        }
    
        const amount =new Decimal(transfer_data.transfer_amount)
        if(amount.lessThan(BASE_CASH)){
            logger.debug('wrong transfer_amount from analysisData(),is lessThanOrEqualTo 0,transfer_amount:',transfer_data.transfer_amount);
            return data
        }
        data.transfer_amount = amount
        return data

    }catch(err){
        logger.error('err from analysisData(),ths track is %O:',err)
        throw err
    }
}


//test
// const data = {
//     pog_account:"test_account",
//     trx_id:"0x033e5a9a9fd1e675516c1de55f4b48699ba5d9ceeee788cad6d8fc3f65919e4b",
//     transfer_from_address:"0x31674f9E16f74C4F123eE98F1549E5eb7b317E5f",
//     transfer_to_address:"0x9e95a55be4b200775623c70af63061fc05869495",
//     transfer_amount:"100"
// }
// recordTransfer(data)

module.exports = recordUe2Usdt