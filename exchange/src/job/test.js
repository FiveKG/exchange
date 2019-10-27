//@ts-check
const {transfer,getTransactionInfo,getTrxAction,getTrxInfoByBlockNumber,rpc} = require('./getEOSTrxAction')
const {psTransfer2Pog} = require('../db')
const {UE_TOKEN,TBG_TOKEN,TBG_TOKEN2} = require('../common/constant/eosConstants')
const sleep = require('./sleep');
var {format,parse,parseISO} = require('date-fns')
const local  = require('date-fns/locale/zh-CN');

const { Decimal } = require("decimal.js");
;(async()=>{
    //转账到TGBJOIN->POG
    // for(let i=1;i<6;i++){
    //     const ue_token = new Decimal(i)
    //     const ue_value = `${ue_token.toFixed(4) } UE`;
    //     const transfer_data ={
    //         "tokenContract"  : UE_TOKEN,
    //         "from"           : TBG_TOKEN,
    //         "to"             : UE_TOKEN,
    //         "quantity"       : ue_value,
    //         "memo"           : `Pog2Eth:${TBG_TOKEN}:${ue_value}`
    //     }
    //     const res = await transfer(transfer_data)
    //     console.log(res)
    //     const transfer_data2 ={
    //         "tokenContract"  : UE_TOKEN,
    //         "from"           : TBG_TOKEN2,
    //         "to"             : UE_TOKEN,
    //         "quantity"       : ue_value,
    //         "memo"           : `Pog2Eth:${TBG_TOKEN2}:${ue_value}`
    //     }
    //     const res2 = await transfer(transfer_data2)
    //     console.log(res2)
    // }
    // console.log('done!')

    //通过区块获取交易信息
    const block_info = await rpc.get_block(18868288)
    let info = block_info.transactions.map(t=>{
        let trx_info = {
            "expiration":"",
            "pog_txtid":"",                                           
            "actions":null
        }
        let trx = t.trx;
        trx_info.pog_txtid= trx.id;
        

        let transaction = trx.transaction;
        trx_info.expiration = transaction.expiration;
       

        trx_info.actions = transaction.actions.filter(action=>action.name=="transfer")
        return trx_info

    })
    console.log(info)                                                                                                                                                                                                                                                                                                                                   
    
    const time = parse(info[0].expiration,'MM/dd/yyyy', new Date());
    const time2 = format(parseISO(info[0].expiration), 'yyyy-MM-dd HH:mm:ss');
    const time3= new Date()
    //const newDate =  new Date(time);
    console.log('=============',time,time2,time3)
 
})();
