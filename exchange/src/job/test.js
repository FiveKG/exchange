//@ts-check
const {transfer,getTransactionInfo,getTrxAction,getTrxInfoByBlockNumber,rpc,getCurrencyBalance} = require('./getEOSTrxAction')
const {acceptTransferEthAccount,getTransaction,getGasPrice,getTokenBalance,getEthBalance,estimateGas,getBlock,getABI,sendSignTransfer} = require('./getEthTrxAction')
const {UE_TOKEN,TBG_TOKEN2} = require('../common/constant/eosConstants')
const {PROVIDER,CONTRACT_ADDRESS,COLD_ADDRESS1,COLD_ADDRESS2,COLD_ADDRESS3,COLD_ADDRESS4,COLD_ADDRESS5,HOT_ADDRESS,ABI} = require("../common/constant/web3Config");
const {sequelize,psTransfer2Pog} = require('../db')
const Web3 = require('web3')
//let web3 = new Web3("http:// 172.19.2.122:39842");
let web3 = new Web3("http://localhost:8545");

const sleep = require('./sleep');
var {format,parse,parseISO} = require('date-fns')
const local  = require('date-fns/locale/zh-CN');
const data_fns = require('date-fns/fromUnixTime')
const { Decimal } = require("decimal.js");

async function test(){
    const balance = await  getTokenBalance("0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2");
    console.log(balance)
}

async function getEosBalance(){
    const balance = await getCurrencyBalance('11g22p33s')
    console.log(balance)
}

async function web3Transfer(){
    const from = '0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2';
    const to = '0xDcCE5Fec3890be188Fca7427794E8b1B62ba5576';
    const amount = 10;
    const privateKey = '781761149574a203d4e744257927824b2e35e0d71ccb273cafcaf9f61e004cd6';
    await sendSignTransfer(from,to,amount,privateKey);
    
}
;(async()=>{
    const result = await getTransactionInfo(650835,'82c4aa42d3dc992749c3d07c32daccc476797bddd11fde9f944f4f177108a5bf')
    console.log(result)
})();
