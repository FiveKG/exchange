//@ts-check
const logger = require("../common/logger").getLogger("transfer2Eth.js");
const {sequelize} = require('../db');
const sleep = require('./sleep')
const {redis} = require("../common");
const {Decimal} = require('decimal.js')
const keyConfig = require("../common/keyConfig.js");
const {HOT_ADDRESS,COLD_ADDRESS5}  =require('../common/constant/web3Config')
const {sendSignTransfer,getTransaction,getHotAddressUSDTBalance} = require('./getEthTrxAction')
const {MINIUSDT,UE2USDT_TAX} = require("../common/constant/exchange_rule")
const TX_STATE = 'tgb:exchange:UE2USDT:tx_hash:';

/**
 * 
 * @param {Object} data 
 */
async function transfer2Eth(data){
    try{    
        const Eth_charge_filed = {
            to_eth_address: data.to_eth_address,
            eth_txid      : '',
            confirm_time  : data.confirm_time,
            exchange_time : new Date(),
            is_exchanged  : true
        }
        const hot_add_balance = new Decimal(await getHotAddressUSDTBalance());
        //转账金额要扣除5个数量手续费，发给规定的钱包地址
        const value = new Decimal(data.quantity).sub(5);
        const charge = new Decimal(UE2USDT_TAX.split(' ')[0]);

        //余额太低需要进行通知
        if(hot_add_balance.sub(value).lessThan(MINIUSDT)){
            logger.debug("hot address balance is too low,balance:",hot_add_balance)
            return
        }
        //转账
        try{

            
            //设置预转账状态,用redis记录，用于防止已经转账未更新数据库
            await redis.set(TX_STATE+data.pog_txid,1);

            let key = await keyConfig.getConfig("HOT_ADDRESS_PRIVATEKEY");
            if(key == ""){
                logger.debug('can not get HOT_ADDRESS_PRIVATEKEY');
                return
            }
            //转给用户
            const trx_id = await sendSignTransfer(HOT_ADDRESS,data.to_eth_address,value.mul(1000000).toNumber(),key );//HOT_ADDRESS_PRIVATEKEY
            if(!trx_id){
                redis.del(TX_STATE+data.pog_txid);
                return
            }

            //转给冷钱包
            await sendSignTransfer(HOT_ADDRESS,COLD_ADDRESS5,charge.mul(1000000).toNumber(),key,5);
            Eth_charge_filed.eth_txid = trx_id;
        }catch(err){
            logger.error('热账号转账失败:',err);
            
            throw err
        }

            //记录更新数据库的值
        const Eth_charge_where = {
            "pog_txid":data.pog_txid
        }
        //更新数据库
        await update_DB(Eth_charge_filed,Eth_charge_where);

        await redis.del(TX_STATE+data.pog_txid);
    }catch(err){
        logger.error('this error from transfer2Eth(),the error is %O',err);
        //转账失败预转账删除状态
        await redis.del(TX_STATE+data.pog_txid);
        throw err
    } 
}
//@ts-ignore
async function update_DB(Eth_charge_filed,Eth_charge_where){
    //事务开始
    const transaction = await sequelize.sequelize.transaction();
    try{ 
       //更新到Eth_charge
       await sequelize.Eth_charge.update(Eth_charge_filed,{
           where:{
               "pog_txid":Eth_charge_where.pog_txid
           }
       });
       //发送事务
       await transaction.commit()
       return true
    }
    catch(err){
       //事务回滚
       await transaction.rollback();
       throw err
    }
}
 
/**
 * 延迟指定的毫秒
 * @param {number} ms 毫秒
 */
function delay(ms){
    const promise = new Promise( ( resolve , reject ) => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
    return promise ;
}


module.exports = transfer2Eth