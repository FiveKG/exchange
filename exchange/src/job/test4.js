//@ts-check
const {transfer,getTransactionInfo,getTrxAction,getTrxInfoByBlockNumber,rpc} = require('./getEOSTrxAction')
const {psTransfer2Pog} = require('../db')
const {UE_TOKEN,TBG_TOKEN,TBG_TOKEN2} = require('../common/constant/eosConstants')
const sleep = require('./sleep')
const { Decimal } = require("decimal.js");
;(async()=>{
    //转账到TGBJOIN->POG
    for(let i=1;i<6;i++){
        const ue_token = new Decimal(i)
        const ue_value = `${ue_token.toFixed(4) } UE`;
        const transfer_data ={
            "tokenContract"  : UE_TOKEN,
            "from"           : TBG_TOKEN,
            "to"             : UE_TOKEN,
            "quantity"       : ue_value,
            "memo"           : `Pog2Eth:${TBG_TOKEN}:${ue_value}`
        }
        const res = await transfer(transfer_data)
        console.log(res)
        const transfer_data2 ={
            "tokenContract"  : UE_TOKEN,
            "from"           : TBG_TOKEN2,
            "to"             : UE_TOKEN,
            "quantity"       : ue_value,
            "memo"           : `Pog2Eth:${TBG_TOKEN2}:${ue_value}`
        }
        const res2 = await transfer(transfer_data2)
        console.log(res2)
    }
    console.log('done!')
    // const block_info = await rpc.get_block(18857405)

    // block_info.transactions.map(transaction=>{
    //     console.log(transaction)
    // })
    // const trx_array = await getTrxInfoByBlockNumber(18857405)
    // console.log(trx_array)
})();
