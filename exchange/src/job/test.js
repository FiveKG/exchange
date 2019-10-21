//@ts-check
const {transfer,getTransactionInfo,getTrxAction} = require('./getEOSTrxAction')
const {sequelize,psTransfer2Pog} = require('../db')
;(async()=>{


    let account = await sequelize.Eth_account.findOne({where:{eth_address:"0xbb123b7f59c2f85049be43bc612c92a04558f1251"}})
    if(!account){
        console.log(account)
        console.warn("warn from parseContractAction(): if(!account),the account is null,the database not exist this account");
    }
})();
