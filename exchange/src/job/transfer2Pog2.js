//@ts-check
const logger = require("../common/logger").getLogger("transfer2Pog.js")
const {sequelize} = require('../db')
const {redis} = require("../common")
//const moment = require('moment')
//const data_fns = require('date-fns/fromUnixTime')
const { Decimal } = require("decimal.js");
const {getBlock,is6confirm} = require('./getEthTrxAction')
const {transfer,getTransactionInfo} = require('./getEOSTrxAction')
const {UE_TOKEN} = require("../common/constant/eosConstants")
const TX_STATE = 'tgb:exchange:Eth:tx_hash:'

/**
 * 解析后的数据
 * @param {{
 * id              : String,
 * eth_txid        : String,
 * from_eth_address: String,
 * to_eth_address  : String,
 * usdt_value      : String,
 * ue_value        : String,
 * recharge_time   : Date|String
 * confirm_time    : Date|null|String,
 * exchange_time   : Date|null|String,
 * is_exchanged    : boolean,
 * eth_blockNumber : Number,
 * pog_blockNumber : Number|null,
 * pog_txid        : String|null,
 * log_info        : String,
 * pog_account     : String
 * }} data 
 */
async function transfer2Pog2(data){
    try{
        /**
         * @type {{
         * confirm_time   : null|Date|String,
         * exchange_time  : null|Date|String,
         * is_exchanged   : boolean,
         * pog_blockNumber: Number|null,
         * pog_txid      : String|null
         * }}
         */
        const Eth_charge_filed = {
            confirm_time: null,
            exchange_time: null,
            is_exchanged: false,
            pog_blockNumber: null,
            pog_txid: null,
        }

        //判断是否6次确认
        if(!await is6confirm(data.eth_txid)){
            return
        }
            
            //判断是否已经转账过，在redis数据丢失的情况下,此操作可以避免兑换过的再给一次
            const isTransfer =await sequelize.Eth_charge.findOne({
                where:{eth_txid:data.eth_txid},
                attributes:['is_exchanged']
            })
            if(!isTransfer){
                logger.debug('查无此交易记录txid:',data.eth_txid)
                return
            }
            if(isTransfer.dataValues.is_exchanged){
                logger.debug(`eth_txid:${data.eth_txid}已经兑换过了`)
                return
            }

            const pog_account = data.pog_account;
            const ue_value = `${new Decimal(data.ue_value).toFixed(4) } UE`;
            Eth_charge_filed.confirm_time = new Date()

            //转账到POG
            try{
                //设置预转账状态,用redis记录
                await redis.set(TX_STATE+data.eth_txid,1)

                const transfer_data ={
                    "tokenContract"  : UE_TOKEN,
                    "from"           : UE_TOKEN,
                    "to"             : pog_account,
                    "quantity"       : ue_value,
                    "memo"           : data.log_info
                }

                const res = await transfer(transfer_data)
                const unix_timestamp  = (await getBlock(data.eth_blockNumber)).timestamp;
                //Eth_charge_filed.confirm_time = moment.utc(moment.unix(unix_timestamp)).format();
                Eth_charge_filed.confirm_time = new Date(unix_timestamp*1000)
                
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

            //更新数据库成功删除预转账状态
            await redis.del(TX_STATE+data.eth_txid)
            logger.debug(`${UE_TOKEN}转账${data.ue_value} UE至${pog_account}成功`)
        

    }
    catch(err){
        logger.error('the error is from transfer2Pog(),the error trace is %O',err)
        throw err
    }

}


/**
 * 
 * @param {{
         * confirm_time   : null|Date|String,
         * exchange_time  : null|Date|String,
         * is_exchanged   : boolean,
         * pog_blockNumber: Number|null,
         * pog_txid      : String|null}} Eth_charge_filed 
 * @param {{
 *        eth_txid:String
 * }} Eth_charge_where 
 */
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
/**
 * 处理转账但是没有更新数据库的情况
 * @param {{
    * confirm_time   : null|Date|String,
    * exchange_time  : null|Date|String,
    * is_exchanged   : boolean,
    * pog_blockNumber: Number|null,
    * pog_txid      : String|null}} Eth_charge_filed 
* @param {{
*        eth_txid:String
* }} Eth_charge_where 
*/
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
// //测试用
// const data = { id: '1pkmKzgtr',
// eth_txid: 
//   '0x3f83cabafe702fc06efc6939eb9bd7a2123e1353ee22f7cc8273f5d20e727b5a',
//  from_eth_address: '0x9e95a55BE4B200775623c70aF63061fc05869495',
//  to_eth_address  : '0x84a5093a0d335bbb630149545b2f3af965686656',
//  usdt_value      : new Decimal(1),
//  ue_value        : new Decimal(1),
//  recharge_time   : "2019-10-24T03:58:15.361Z",
//  confirm_time    : null,
//  exchange_time   : null,
//  is_exchanged    : false,
//  eth_blockNumber : 9054,
//  pog_blockNumber : null,
//  pog_account     : 'tbgjoin',
//  pog_txid        : null,
//  log_info        : 'Eth2Pog' }


// transfer2Pog(data)

module.exports = transfer2Pog2