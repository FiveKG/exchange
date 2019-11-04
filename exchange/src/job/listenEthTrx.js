// @ts-check
const logger = require("../common/logger.js").getLogger("listenEthTrx.js")
const { redis,generate_unique_key } = require("../common");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const { BASE_AMOUNT,UE2USDT_RATE,EXPIRATION_HOUR} = require("../common/constant/exchange_rule")
const {getBlock,getTransaction,BN2String} = require("./getEthTrxAction")
const {ADDRESSES} = require("../common/constant/web3Config")
const BLOCK_NUMBER = "tbg:exchange:Eth:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eth:tx_number"
const {sequelize,psTransfer2Pog} = require('../db')
logger.debug(`handlerTransferActions running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eth`;
let count = 1;
scheduleJob("*/10 * * * * *", begin);
// 如果中途断开，再次启动时计数到 10 以后清除缓存
async function begin() {
    try {
        const investLock = await redis.get(INVEST_LOCK);
        if (!investLock) {
            await handlerTransferActions();
            count = 0;
        } else {
            if (count > 10)  {
                await redis.del(INVEST_LOCK);
            } else {
                count += 1;
            }
            return;
        }
    } catch (err) {
        throw err;
    }
}

/**
 * 监听智能合约账号的转账记录
 */
async function handlerTransferActions() {
    try {
        await redis.set(INVEST_LOCK, 1);
        const now = new Date();
        /** 
         * 数据库算法：每次固定时间，获取所有未兑换的主键id，根据充值时间排序，从最新时间开始排序；
         * 获得的主键id统统放入数组，因为是id索引，速度会很快
         * 每次从数组拿出10个id，根据id去查具体信息，此时还是通过主键索引，速度依然很快
        */

        
        //从数据库获取没有完成的交易
        const sql_transactions_id = await sequelize.Eth_charge.findAll({
            where:{is_exchanged:false},
            attributes:["id"],
            raw: true,
        });
        
        const id_array= sql_transactions_id.map(element=>{
            return element.id
        })
        while(1){
            const new_array = id_array.splice(0,10);
            if(new_array.length===0)break
            const sql_transactions = await sequelize.Eth_charge.findAll({
                where:{id:new_array},
                attributes:["eth_txid",'recharge_time','pog_account','ue_value','usdt_value'],
                order:[['recharge_time','DESC']],
                raw: true,
            });
            const minute = 1000 * 60;
            const hour = minute * 60;
            for(const transaction of sql_transactions){
                const eth_txid      = transaction.eth_txid;
                const recharge_time = new Date(transaction.recharge_time);
                const pog_account   = transaction.pog_account;
                const ue_value      = transaction.ue_value;
                const h =( now.getTime() - recharge_time.getTime())/hour;
                
                if(h>=EXPIRATION_HOUR)
                {
                    logger.debug(`${eth_txid} is over to 24hr,delete it!`)
                    await sequelize.Eth_charge.destroy({
                        where: {eth_txid:eth_txid}
                    })
                    continue
                }

                const transaction_info = await getTransaction(eth_txid);
                const data = await  parseTransaction(transaction_info,transaction.usdt_value);

                if(!data) continue
                data.ue_value = ue_value;
                data.pog_account = pog_account;
                
                //转账
                //await psTransfer2Pog.pub(data)
            }
        }

        await redis.del(INVEST_LOCK);
        return
    } catch (err) {
        logger.error('this error from handlerTransferActions(),the error trace is O%',err)
        throw err;
    }
}


/**
 * 
 * @param {Object} transaction_info  某一记录
 * @param {String} usdt_value
 * @returns {Promise<Object>} 解析后的数据
 */
async function parseTransaction(transaction_info,usdt_value){
    try{
        /**
         * @type {{
         *  eth_txid : String|null,
         *  confirm_time:Date|null,
         *  eth_blockNumber:Number|null,
         *  eth_confirm_blockNumber:Number|null,
         *  usdt_values:String|null
         * }}
         */
        const data = {
            eth_txid : null,
            confirm_time :null,
            eth_blockNumber : null,
            eth_confirm_blockNumber :null,
            usdt_values :null,
        }

        if(!transaction_info||!transaction_info.blockNumber){
            logger.debug(`error:transaction_info:${transaction_info},transaction_info.blockNumber:${transaction_info.blockNumber}`)
            return false;
        }
        if(transaction_info.method !=='transfer'){
            logger.debug(`error:transaction_info.method:${transaction_info.method}`)
            return false;
        } 

        const to_address = "0x"+transaction_info.inputs[0];
        if(!ADDRESSES.includes(to_address)){
            logger.debug(`error:to_address:${to_address}`)
            return false;
        } 

        const transfer_amount = transaction_info.inputs[1];
        const amount = await BN2String(transfer_amount)
        const usdt_amount = new Decimal(usdt_value)
        if(!usdt_amount.equals(amount)){
            logger.debug(`error:db_usdt_value not equals to end point usdt_value!db_usdt_value:${usdt_value},end point:${amount}`);
            return false
        }
        
        const lastBlock = await getBlock();
        const eth_txid                = transaction_info.hash;
        const block_info              = await getBlock(transaction_info.blockNumber);
        const eth_blockNumber         = parseInt(transaction_info.blockNumber);
        const eth_confirm_blockNumber = eth_blockNumber+6;
        const confirm_time            = new Date(block_info.timestamp*1000);
        const usdt_values             = amount;
        //不满足6次确认也先放着 
        if(eth_blockNumber>lastBlock){
            logger.debug(`not enough to 6 confirm!`)
            return false
        } 

        data.eth_txid                = eth_txid;
        data.confirm_time            = confirm_time;
        data.eth_confirm_blockNumber = eth_confirm_blockNumber;
        data.eth_blockNumber         = eth_blockNumber;
        data.usdt_values             = usdt_values;
        return data
    }
    catch(err){
        logger.error('this error from parseContractAction(),the error trace is O%',err)
        throw err;
    }
}




module.exports = handlerTransferActions;