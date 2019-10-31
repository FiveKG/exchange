//@ts-check
const logger = require("../common/logger").getLogger("transfer2Pog.js");
const {sequelize} = require('../db');
const {redis} = require("../common");
const TX_STATE = 'tgb:exchange:Eth:tx_hash:';
const {Decimal} = require('decimal.js')
const {UE_TOKEN} = require("../common/constant/eosConstants");
const {transfer,getTransactionInfo} = require('./getEOSTrxAction');
/**
 * 
 * @param {{
 * pog_account:String,
*  eth_txid : String,
*  confirm_time:Date,
*  eth_blockNumber:Number,
*  ue_value:String,
*  eth_confirm_blockNumber:Number
* }} data 
 */
async function transfer2Pog(data){
    try{
        /**
         * @type {{
            * confirm_time           : Date|String,
            * eth_blockNumber        : Number,
            * eth_confirm_blockNumber: Number,
            * exchange_time          : null|Date|String,
            * is_exchanged           : boolean,
            * pog_blockNumber        : Number|null,
            * pog_txid               : String|null,
            * ue_value               : String
            * }}
            */
           const Eth_charge_filed = {
               confirm_time           : data.confirm_time,
               eth_blockNumber        : data.eth_blockNumber,
               eth_confirm_blockNumber: data.eth_confirm_blockNumber,
               exchange_time          : null,
               is_exchanged           : false,
               pog_blockNumber        : null,
               pog_txid               : null,
               ue_value               : data.ue_value
           }

            const pog_account = data.pog_account;
            const ue_value = `${new Decimal(data.ue_value).toFixed(4) } UE`;
           //转账
           try{
            //设置预转账状态,用redis记录
            await redis.set(TX_STATE+data.eth_txid,1)

            const transfer_data ={
                "tokenContract"  : UE_TOKEN,
                "from"           : UE_TOKEN,
                "to"             : pog_account,
                "quantity"       : ue_value,
                "memo"           : ""
            }
            
            const res = await transfer(transfer_data)
            
            Eth_charge_filed.exchange_time = new Date();
            Eth_charge_filed.pog_blockNumber = res.processed.block_num;
            Eth_charge_filed.pog_txid = res.processed.id;
            Eth_charge_filed.exchange_time= new Date()
            Eth_charge_filed.is_exchanged = true;

        }catch(err){
            logger.error(pog_account+'接收转账操作失败:',err)
            //转账失败预转账删除状态
            await redis.del(TX_STATE+data.eth_txid)
            throw err
        }

        //记录更新数据库的值
        const Eth_charge_where = {
            "eth_txid":data.eth_txid
        }
        //更新数据库
        try{
            await update_DB(Eth_charge_filed,Eth_charge_where);
        }catch(err){
            logger.error(`${UE_TOKEN}转账至${pog_account}更新数据库失败,重新处理`,err);
            const tx_state =await redis.get(TX_STATE+Eth_charge_where.eth_txid)
            if(tx_state){
                const update_result = await check_exchange(Eth_charge_filed,Eth_charge_where);
            }
        }

    }catch(err){
        logger.error('this error from transfer2Pog(),the error trace is O%',err)
        throw err;
    } 
}


async function update_DB(Eth_charge_filed,Eth_charge_where){
//事务开始
const transaction = await sequelize.sequelize.transaction();
try{ 
   //更新到Eth_charge
   await sequelize.Eth_charge.update(Eth_charge_filed,{
       where:{
           "eth_txid":Eth_charge_where.eth_txid
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


async function check_exchange(Eth_charge_filed,Eth_charge_where){
    try{

        const sql_result = await sequelize.Eth_charge.findOne({
            where:{eth_txid:Eth_charge_where.eth_txid},
            attributes:['is_exchanged']
        })
        //查询pog交易信息,查看是否已经交易，但是数据库没有更新
        //@ts-ignore
        const trx_info =await getTransactionInfo(Eth_charge_filed.pog_blockNumber,Eth_charge_filed.pog_txid);
        if(trx_info){
            // @ts-ignore
            if(trx_info.status ==='executed' && !sql_result.dataValues.is_exchanged){
                //已转账未更新,重新执行
                const update_result = await update_DB(Eth_charge_filed,Eth_charge_where)
                return update_result
            }
        }
    }
    catch(err){
        logger.error('this is check_exchange(),the error trace is %O',err);
        throw err
    }
   
}

module.exports = transfer2Pog