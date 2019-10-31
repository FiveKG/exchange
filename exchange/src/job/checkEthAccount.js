//@ts-check
const logger = require("../common/logger").getLogger('check_eth_account.js');
const {acceptTransferEthAccount,estimateGas,getEthBalance,getTokenBalance} = require("./getEthTrxAction");
const {Decimal} = require('decimal.js')
/**
 * 
 * @param {String} transfer_from_address
 * @param {String} transfer_amount
 */
async function check_eth_account(transfer_from_address,transfer_amount){
    try{
        const amount = new Decimal(transfer_amount);
        //不符合要求的返回空
        if(amount.isNaN()||amount.isZero()||amount.isNegative()){
            return 
        }
        const transfer_to_address = await acceptTransferEthAccount(transfer_amount);
        const estimate_gas_Gwei = await estimateGas(transfer_from_address,transfer_to_address,transfer_amount);
        const gas_Gwei_balance = await getEthBalance(transfer_from_address);
        const usdt_balance = await getTokenBalance(transfer_from_address);
        
        return {transfer_to_address,estimate_gas_Gwei,gas_Gwei_balance,usdt_balance}
    
    }catch(err){
        logger.error('this error from check_eth_account(),the error trace is %O',err)
        throw err
    }
}
module.exports = check_eth_account;