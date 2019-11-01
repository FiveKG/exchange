//@ts-check
const {transfer,getTransactionInfo,getTrxAction,getTrxInfoByBlockNumber,rpc} = require('./getEOSTrxAction')
const {acceptTransferEthAccount,getTokenBalance,getEthBalance,estimateGas,getBlock,getABI} = require('./getEthTrxAction')
const {UE_TOKEN,TBG_TOKEN2} = require('../common/constant/eosConstants')
const {PROVIDER,CONTRACT_ADDRESS,COLD_ADDRESS1,COLD_ADDRESS2,COLD_ADDRESS3,COLD_ADDRESS4,COLD_ADDRESS5,HOT_ADDRESS,ABI} = require("../common/constant/web3Config");
const {sequelize,psTransfer2Pog} = require('../db')

const sleep = require('./sleep');
var {format,parse,parseISO} = require('date-fns')
const local  = require('date-fns/locale/zh-CN');
const data_fns = require('date-fns/fromUnixTime')
const { Decimal } = require("decimal.js");

async function test(){
    web3.eth.accounts.decrypt()
}
;(async()=>{
    
})();
