//@ts-check
const logger = require("../common/logger").getLogger("transfer2Charge.js");
const {sequelize,psServiceCharge} = require('../db');
const {Decimal} = require('decimal.js');
const keyConfig = require("../common/keyConfig.js");
const {HOT_ADDRESS,COLD_ADDRESS5}  =require('../common/constant/web3Config');
const sleep = require('./sleep')
const {sendSignTransfer,getTransaction,getHotAddressUSDTBalance} = require('./getEthTrxAction')
/**
 * @param {Object} data
 */
async function transfer2Charge(data){
    try{
        await sleep(10000)
        //转给冷钱包
        try{
            let key = await keyConfig.getConfig("HOT_ADDRESS_PRIVATEKEY");
            if(key == ""){
                logger.debug('can not get HOT_ADDRESS_PRIVATEKEY');
                return
            }
            const amount = new Decimal(data.amount).mul(1000000).toNumber()
            
            const result  = await sendSignTransfer(HOT_ADDRESS,COLD_ADDRESS5,amount,key,1);
            data.eth_txid = result;
            }catch(err){
                logger.error('转账手续费失败',err)
                throw err
            }
            
            //事务开始,插入/更新数据库
            const transaction = await sequelize.sequelize.transaction();
            try{
                await sequelize.Eth_tax.create(data)
                await sequelize.Eth_charge.update({service_charge:data.id},{where:{"id":data.charge_id}});
                //发送事务
                await transaction.commit()
            }catch(err){
                 //事务回滚
                await transaction.rollback();
                throw err
            }

    }catch(err){
        logger.error('this error from transfer2Charge(),the error is %O',err);
        throw err
    }
}


 

module.exports = transfer2Charge