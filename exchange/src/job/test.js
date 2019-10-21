//@ts-check
const {transfer,getTransactionInfo,getTrxAction} = require('./getEOSTrxAction')
const {sequelize,psTransfer2Pog} = require('../db')
;(async()=>{


    const sql_result = await sequelize.Eth_charge.findOne({
        where:{txid:"0x3cce7e5043c8d01b9eca600408c7270ed08c843d9e634e7dbf2c657a712ea639"},
        attributes:['is_exchanged']
    })
    console.log(sql_result)
})();
