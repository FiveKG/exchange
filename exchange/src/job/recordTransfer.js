//@ts-check
const logger = require("../common/logger.js").getLogger("recordTransfer.js");
const {ADDRESSES} =require("../common/constant/web3Config");
const {USDT2UE_RATE,USDT2UE_TAX} = require("../common/constant/exchange_rule")
const {Decimal} = require('decimal.js');
const { generate_unique_key } = require("../common");
const {sequelize} = require('../db');

/**
 * 
 * @param {{
 * pog_account          : String,
 * trx_id               : String,
 * transfer_from_address: String,
 * transfer_to_address  : String,
 * transfer_amount      : Number
 * }} transfer_data 
 */
async function recordTransfer(transfer_data){
    try{
        const {the_pog_account,trx_id,transfer_from_address,transfer_to_address,transfer_amount}  = await analysisData(transfer_data);
        if(!the_pog_account||!trx_id||!transfer_from_address||!transfer_to_address||!transfer_amount){
            console.log('数据不符合要求',the_pog_account,trx_id,transfer_from_address,transfer_to_address,transfer_amount);
            return 2000
        }

        const id = await generate_unique_key();
        const eth_txid = trx_id
        const from_eth_address = transfer_from_address;
        const to_eth_address = transfer_to_address;
        const usdt_value = transfer_amount;
        const ue_value = await Usdt2Ue(transfer_amount);
        const recharge_time = new Date();
        const is_exchanged = false;
        const pog_account = the_pog_account;
        const service_charge = USDT2UE_TAX;
        const exchange_rate = USDT2UE_RATE;
        const log_info = "USDT2UE"
        //插入数据库
        try{
            const result = await sequelize.Eth_charge.create({id,eth_txid,from_eth_address,to_eth_address,usdt_value,ue_value,recharge_time,is_exchanged,pog_account,service_charge,exchange_rate,log_info});
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
    * pog_account          : String,
    * trx_id               : String,
    * transfer_from_address: String,
    * transfer_to_address  : String,
    * transfer_amount      : Number
    * }} transfer_data 
*  @returns {Promise<Object>} 
    */
async function analysisData(transfer_data){
    try{
        /**
         * @type {{
        * the_pog_account          : String|null,
        * trx_id               : String|null,
        * transfer_from_address: String|null,
        * transfer_to_address  : String|null,
        * transfer_amount      : Number
         * }}
         */
        const data = {
            the_pog_account          : null,
            trx_id               : null,
            transfer_from_address: null,
            transfer_to_address  : null,
            transfer_amount      : 0
        }
        
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

        //transfer_from_address
        if(!transfer_data.transfer_from_address){
            logger.debug('wrong transfer_from_address from analysisData(),transfer_from_address:',transfer_data.transfer_from_address)
            return data
        }
        data.transfer_from_address = transfer_data.transfer_from_address;

        //transfer_to_address
        if(!transfer_data.transfer_to_address||!ADDRESSES.includes(transfer_data.transfer_to_address)){
            logger.debug('wrong transfer_to_address from analysisData(),transfer_to_address:',transfer_data.transfer_to_address)
            return data
        }
        data.transfer_to_address = transfer_data.transfer_to_address;

        const amount = new Decimal(transfer_data.transfer_amount)
        if(amount.lessThanOrEqualTo(0)){
            logger.debug('wrong transfer_amount from analysisData(),is lessThanOrEqualTo 0,transfer_amount:',transfer_data.transfer_amount);
            return data
        }
        data.transfer_amount = amount.toNumber()

        return data

    }catch(err){
        logger.error('err from analysisData(),ths track is %O:',err)
        throw err
    }
}


/**
 * 
 * @param {String} amount 
 * @returns {Promise<String>} 
 */
async function Usdt2Ue(amount){
    const amount_obj = new Decimal(amount)
    //兑换比例；保留8位小数点，向下四舍五入
    let value = amount_obj.mul(USDT2UE_RATE).toDecimalPlaces(8, Decimal.ROUND_DOWN)
    return value.toString()
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

module.exports = recordTransfer