//@ts-check
const logger = require("../common/logger").getLogger('getPublicExamination.js');
const {Decimal} = require('decimal.js');
const {COLD_ADDRESS1,COLD_ADDRESS2,COLD_ADDRESS3,COLD_ADDRESS4,COLD_ADDRESS5,HOT_ADDRESS} = require("../common/constant/web3Config");
const {get_UE_status,getCurrencyBalance} = require('./getEOSTrxAction');
const {getTokenBalance} = require('./getEthTrxAction')
const {UE_TOKEN,UE_TOKEN2} = require('../common/constant/eosConstants')
/**
 * 返回公审数据
 */
async function getPublicExamination(){
    try{
        const hot_address_balance_eth = new Decimal(await getTokenBalance(HOT_ADDRESS)).div(1000000);
        const cold_address1_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS1)).div(1000000);
        const cold_address2_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS2)).div(1000000);
        const cold_address3_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS3)).div(1000000);
        const cold_address4_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS4)).div(1000000);
        const cold_address5_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS5)).div(1000000);
        const ue_token_balance   =  new Decimal((await getCurrencyBalance(UE_TOKEN))[0].split(" ")[0]);
        const ue_token2_balance   =  new Decimal((await getCurrencyBalance(UE_TOKEN2))[0].split(" ")[0]);
        const get_UE_balance= await get_UE_status();
        const current_ue = new Decimal(get_UE_balance.current_amount);

        const all_eth_balance = hot_address_balance_eth.plus(cold_address1_balance_eth).plus(cold_address2_balance_eth).plus(cold_address3_balance_eth).plus(cold_address4_balance_eth).plus(cold_address5_balance_eth);
        const wait_transfer = current_ue.sub(all_eth_balance);
   
        const data ={
            get_UE_balance:get_UE_balance,
            all_eth_balance:all_eth_balance,
            HC_address_eth_balance:[
                {name:"hot wallet",address:HOT_ADDRESS,balance:hot_address_balance_eth},
                {name:"cold1 wallet",address:COLD_ADDRESS1,balance:cold_address1_balance_eth},
                {name:"cold2 wallet",address:COLD_ADDRESS2,balance:cold_address2_balance_eth},
                {name:"cold3 wallet",address:COLD_ADDRESS3,balance:cold_address3_balance_eth},
                {name:"cold4 wallet",address:COLD_ADDRESS4,balance:cold_address4_balance_eth},
                {name:"service_charge wallet",address:COLD_ADDRESS5,balance:cold_address5_balance_eth},
            ],
            two_address_UE_balance:[
                {name:UE_TOKEN,balance:ue_token_balance},
                {name:UE_TOKEN2,balance:ue_token2_balance},
            ],
            wait_transfer:wait_transfer
        }
    
        return data
    }catch(err){
        logger.error('this error from publicExamination(),the error trace is %O',err)
        throw err
    }

}
module.exports = getPublicExamination