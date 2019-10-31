// @ts-check
const logger = require("../common/logger.js").getLogger("listenEthTrx.js")
const { redis,generate_unique_key } = require("../common");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const { BASE_AMOUNT,UE2USDT_RATE,EXPIRATION_HOUR} = require("../common/constant/exchange_rule")
const {getBlock,getTransaction} = require("./getEthTrxAction")
const {ADDRESSES} = require("../common/constant/web3Config")
const BLOCK_NUMBER = "tbg:exchange:Eth:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eth:tx_number"
const {sequelize,psTransfer2Pog} = require('../db')
logger.debug(`handlerTransferActions running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eth`;
let count = 1;
scheduleJob("*/4 * * * * *", begin);
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
         * 两种情况：一种是redis的区块号没跟上最新区块号，一种是redis已经追上最新区块号。
         * 每次从redis获取区块号进行处理，处理如果成功结束，则与最新区块号对比
         * if(redis.block<lastBlock),redis.block+1,否则对比
        */
        // const redis_block_number = await getLastBlockNumber();
        // const blockInfo = await getBlock(redis_block_number);
        // if(!blockInfo.transactions)return
        // const block_time = new Date(blockInfo.timestamp*1000);

        
        //从数据库获取没有完成的交易
        const sql_transactions = await sequelize.Eth_charge.findAll({
            where:{is_exchanged:false},
            attributes:['eth_txid','recharge_time','pog_account','ue_value'],
            limit: 1,
            raw: true,
        });

        const minute = 1000 * 60;
        const hour = minute * 60;

        for(const transaction of sql_transactions){
            const eth_txid      = transaction.eth_txid;
            const recharge_time = new  Date(transaction.recharge_time);
            const pog_account   = transaction.pog_account;
            const ue_value      = transaction.ue_value;
            const h =( now.getTime() - recharge_time.getTime())/hour;
            //等待超过24小时，有可能发生的问题是，每次数据库拿到的都是预期的前几个
            if(h>=EXPIRATION_HOUR)continue

            const transaction_info = await getTransaction(eth_txid);
            const data = await  parseTransaction(transaction_info)
            if(!data) continue
            data.ue_value = ue_value;
            data.pog_account = pog_account;
            //转账
            await psTransfer2Pog.pub(data)
        }

        await redis.del(INVEST_LOCK);
        return
    } catch (err) {
        logger.error('this error from handlerTransferActions(),the error trace is O%',err)
        throw err;
    }
}


handlerTransferActions()
/**
 * 
 * @param {Object} transaction_info  某一记录
 * @returns {Promise<Object>} 解析后的数据
 */
async function parseTransaction(transaction_info){
    try{
        /**
         * @type {{
         *  eth_txid : String|null,
         *  confirm_time:Date|null,
         *  eth_blockNumber:Number|null,
         *  eth_confirm_blockNumber:Number|null
         * }}
         */
        const data = {
            eth_txid : null,
            confirm_time :null,
            eth_blockNumber : null,
            eth_confirm_blockNumber :null,
        }

        if(!transaction_info||!transaction_info.blockNumber)return false;
        if(transaction_info.method !=='transfer') return false;

        const to_address = "0x"+transaction_info.inputs[0];
        if(!ADDRESSES.includes(to_address)) return false;

        const lastBlock = await getBlock();
        const eth_txid                = transaction_info.hash;
        const block_info              = await getBlock(transaction_info.blockNumber);
        const eth_blockNumber         = parseInt(transaction_info.blockNumber);
        const eth_confirm_blockNumber = eth_blockNumber+6;
        const confirm_time            = new Date(block_info.timestamp*1000);
        
        //不满足6次确认也先放着
        if(eth_blockNumber>lastBlock) return false

        data.eth_txid                = eth_txid;
        data.confirm_time            = confirm_time;
        data.eth_confirm_blockNumber = eth_confirm_blockNumber;
        data.eth_blockNumber         = eth_blockNumber;
        return data
    }
    catch(err){
        logger.error('this error from parseContractAction(),the error trace is O%',err)
        throw err;
    }
}




module.exports = handlerTransferActions;