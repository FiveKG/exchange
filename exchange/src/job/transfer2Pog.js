//@ts-check
const logger = require("../common/logger").getLogger("transfer2Pog.js")
const {sequelize} = require('../db')
const {getCurrentDate,generate_unique_key,redis} = require("../common")
const { Decimal } = require("decimal.js");
const sleep = require("./sleep")
const {getBlock,getTokenBalance} = require('./getEthTrxAction')
const {transfer,getCurrencyBalance:getUeBalance,getTransactionInfo} = require('./getEOSTrxAction')
const {UE_TOKEN} = require("../common/constant/eosConstants")
const TX_STATE = 'tgb:exchange:Eth:tx_hash:'
const current_time = getCurrentDate()
/**
 * 解析后的数据
 * @param {{
 * id             : String,
 * txid           : String,
 * from_address   : String,
 * to_address     : String,
 * token_value    : Decimal,
 * ue_value       : String,
 * recharge_time  : Date|String
 * confirm_time   : Date|null
 * exchange_time  : Date|null,
 * is_exchanged   : boolean ,
 * eth_blockNumber: Number,
 * pog_blockNumber: Number|null,
 * pog_txtid      : String|null,
 * log_info       : String,
 * pog_account    : String
 * }} data 
 */
async function transfer2Pog(data){

    try{
        /**
         * @type {{
         * confirm_time   : null|Date,
         * exchange_time  : null|Date,
         * is_exchanged   : boolean,
         * pog_blockNumber: Number|null,
         * pog_txtid      : String|null
         * }}
         */
        const Eth_charge_filed = {
            confirm_time: null,
            exchange_time: null,
            is_exchanged: false,
            pog_blockNumber: null,
            pog_txtid: null,
        }

        //判断是否已经转账过
        const isTransfer =await sequelize.Eth_charge.findOne({
            where:{txid:data.txid},
            attributes:['is_exchanged']
        })
        if(!isTransfer){
            logger.debug('查无此交易记录txid:',data.txid)
            return
        }
        //在redis数据丢失的情况下,此操作可以避免兑换过的再给一次
        if(isTransfer.dataValues.is_exchanged){
            logger.debug(`txid:${data.txid}已经兑换过了`)
            return
        }

        const current_blockNumber = await getBlock();
        if(data.eth_blockNumber+6<current_blockNumber){
            //6次确认，转账
            const pog_account = data.pog_account;
            const ue_token = new Decimal(data.ue_value)
            const ue_value = `${ue_token.toFixed(4) } UE`;
            Eth_charge_filed.confirm_time = getCurrentDate()

            //转账到POG
            try{
                //设置预转账状态,用redis记录
                await redis.set(TX_STATE+data.txid,1)

                const transfer_data ={
                    "tokenContract"  : UE_TOKEN,
                    "from"           : UE_TOKEN,
                    "to"             : pog_account,
                    "quantity"       : ue_value,
                    "memo"           : data.log_info
                }

                const res = await transfer(transfer_data)
                Eth_charge_filed.confirm_time = getCurrentDate();
                Eth_charge_filed.pog_blockNumber = res.processed.block_num;
                Eth_charge_filed.pog_txtid = res.processed.id;
                Eth_charge_filed.exchange_time= getCurrentDate()
                Eth_charge_filed.is_exchanged = true;
            }catch(err){
                logger.error(pog_account+'接收转账操作失败:',err)
                //转账失败预转账删除状态
                await redis.del(TX_STATE+data.txid)
                throw err
            }

            //记录更新数据库的值
            const token_balance = await getTokenBalance(data.to_address)
            const ue_balance = (await getUeBalance(pog_account)).pop().replace(' UE','');
            const Eth_account_filed = {
                "token_value":token_balance,
                "ue_balance":ue_balance
            }
            const Eth_account_where = {
                "pog_account":pog_account,
                "eth_address": data.to_address
            }
            const Eth_charge_where = {
                "txid":data.txid
            }
            //更新数据库
            try{
                await update_DB(Eth_charge_filed,Eth_account_filed,Eth_account_where,Eth_charge_where);
            }catch(err){
                logger.error(`${UE_TOKEN}转账至${Eth_account_where.pog_account}更新数据库失败,重新处理`,err);
                const tx_state =await redis.get(TX_STATE+Eth_charge_where.txid)
                if(tx_state){
                    const update_result = await check_exchange(Eth_charge_filed,Eth_account_filed,Eth_account_where,Eth_charge_where);
                }
                
            }

            //更新数据库成功删除预转账状态
            await redis.del(TX_STATE+data.txid)
            logger.debug(`${UE_TOKEN}转账${data.ue_value} UE至${pog_account}成功`)
        }
        else{
            //没有6次确认，则不停调用自身
            const current_T = getCurrentDate()
            const differ_second = (current_T.getTime()-current_time.getTime())/1000
            //如果调用了超过100秒仍然没有6次确认，则直接结束；一般不可能发生：节点正常但是没有矿工在挖矿
            if(differ_second>100){
                return
            }else{
                console.log(`等待6次确认，已经等待${differ_second}秒`)
                sleep(1000)
                await transfer2Pog(data);
            }
        }
    }
    catch(err){
        logger.error('the error is from transfer2Pog(),the error trace is %O',err)
        throw err
    }

}


/**
 * 
 * @param {{
         * confirm_time   : null|Date,
         * exchange_time  : null|Date,
         * is_exchanged   : boolean,
         * pog_blockNumber: Number|null,
         * pog_txtid      : String|null}} Eth_charge_filed 
 * @param {{
 *          token_value:String,
 *          ue_balance:any}} Eth_account_filed 
 * @param {{
 *        pog_account:String,
 *        eth_address:String}} Eth_account_where 
 * @param {{
 *        txid:String
 * }} Eth_charge_where 
 */
async function update_DB(Eth_charge_filed,Eth_account_filed,Eth_account_where,Eth_charge_where){
    //事务开始
    //const transaction = await sequelize.sequelize.transaction();
    try{ 
        //更新到Eth_charge
        await sequelize.Eth_charge.update(Eth_charge_filed,{
            where:{
                "txid":Eth_charge_where.txid
            }
        });
        //更新到Eth_account
        await sequelize.Eth_account.update(Eth_account_filed,{
            where:Eth_account_where
        })
        //发送事务
        //await transaction.commit()
        return true
    }
    catch(err){
        //事务回滚
        //await transaction.rollback();
        throw err
    }
}
/**
 * 处理转账倒是没有更新数据库的情况
 * @param {{
    * confirm_time   : null|Date,
    * exchange_time  : null|Date,
    * is_exchanged   : boolean,
    * pog_blockNumber: Number|null,
    * pog_txtid      : String|null}} Eth_charge_filed 
* @param {{
*          token_value:String,
*          ue_balance:any}} Eth_account_filed 
* @param {{
*        pog_account:String,
*        eth_address:String}} Eth_account_where 
* @param {{
*        txid:String
* }} Eth_charge_where 
*/
async function check_exchange(Eth_charge_filed,Eth_account_filed,Eth_account_where,Eth_charge_where){
    try{

        const sql_result = await sequelize.Eth_charge.findOne({
            where:{txid:Eth_charge_where.txid},
            attributes:['is_exchanged']
        })
        //查询pog交易信息
        //@ts-ignore
        const trx_info =await getTransactionInfo(Eth_charge_filed.pog_blockNumber,Eth_charge_filed.pog_txtid);
        if(trx_info){
            
            // @ts-ignore
            if(trx_info.status ==='executed' && !sql_result.dataValues.is_exchanged){
                //已转账未更新,重新执行
                const update_result = await update_DB(Eth_charge_filed,Eth_account_filed,Eth_account_where,Eth_charge_where)
                return update_result
            }
        }
    }
    catch(err){
        logger.error('this is check_exchange(),the error trace is %O',err);
        throw err
    }
   
}
//测试用
// const data = { id: 'test1',
// txid:
//  '0xb92b2b3bb6d0e20725d2e39c92a42154b89e5ec1edd06302974465b0a32370dd',
// from_address: '0x2a6F0E7cE6CB445Cb8d1928274792DaB9f28107C',
// to_address: '0x33f9fb77222ccaaa45f76cb680b99c371014e72e',
// token_value: new Decimal(100),
// ue_value: new Decimal(100),
// recharge_time: "2019-10-18T14:40:08.215Z",
// confirm_time: null,
// exchange_time: null,
// is_exchanged: false,
// eth_blockNumber: 9024,
// pog_blockNumber: null,
// pog_txtid: null,
// log_info: '' }


// transfer2Pog(data)

module.exports = transfer2Pog