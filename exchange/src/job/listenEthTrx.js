// @ts-check
const logger = require("../common/logger.js").getLogger("listenEthTrx.js")
const { redis,generate_unique_key } = require("../common");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const { UE2USDT_RATE,EXPIRATION_HOUR} = require("../common/constant/exchange_rule")
const {getBlock,getTransaction,isLegal} = require("./getEthTrxAction")
const {ADDRESSES} = require("../common/constant/web3Config")
const BLOCK_NUMBER = "tbg:exchange:Eth:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eth:tx_number"
const {sequelize,psTransfer2Pog} = require('../db')
logger.debug(`handlerTransferActions running...`);

// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eth`;
let count = 1;

async function StartJob(){
    setTimeout(async function(){
        try {
           await handlerTransferActions();
        } catch (error) {
            logger.error(`定时器层异常`, error);
        }
        await StartJob()
    }, 2000)
}

StartJob();

/**
 * 监听智能合约账号的转账记录
 */
async function handlerTransferActions() {
    try {
        const now = new Date();
        /** 
         * 数据库算法：每次固定时间，获取所有未兑换的主键id，根据充值时间排序，从最新时间开始排序；
         * 获得的主键id统统放入数组，因为是id索引，速度会很快
         * 每次从数组拿出10个id，根据id去查具体信息，此时还是通过主键索引，速度依然很快
        */

        
        //从数据库获取没有完成的交易
        const sql_transactions = await sequelize.Eth_charge.findAll({
            where:{
                is_exchanged: false,
                log_info: 'USDT2UE',
                is_queue    : false
            },
            attributes:[ "id", "eth_txid",'recharge_time','pog_account','ue_value','usdt_value'],
            order:[['recharge_time','ASC']],
            limit: 1,
            raw: true,
        });
        const minute = 1000 * 60;
        const hour = minute * 60;
        for(let transaction of sql_transactions){
            logger.debug("transaction: ", JSON.stringify(transaction, null, 4));
            if (!transaction.eth_txid || !transaction.recharge_time || !transaction.pog_account || !transaction.ue_value) {
                logger.debug('缺少参数，转账不合法：', JSON.stringify(transaction, null, 4));
                await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                continue; 
            }
            const eth_txid      = transaction.eth_txid;
            const recharge_time = new Date(transaction.recharge_time);
            const pog_account   = transaction.pog_account;
            const ue_value      = transaction.ue_value;
            const h =( now.getTime() - recharge_time.getTime())/hour;
            // 24 小时未确认
            if(h>=EXPIRATION_HOUR)
            {
                logger.debug(`${eth_txid} is over to 24hr,delete it!`);
                await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                // await sequelize.Eth_charge.destroy({
                //     where: {eth_txid:eth_txid}
                // })
               
            }
            // null, isLegalResult.status ==> false || true
            const isLegalResult = await isLegal(eth_txid);
            logger.debug('交易状态：', isLegalResult);
            if(isLegalResult === null){
                logger.debug('交易未确认，转账不合法：', eth_txid);
                //需要重新转账 转账失败 is_queue = 2  by hu
                await sequelize.sequelize.query(`update Eth_charge set is_queue = 2 where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                continue; 
            }
            if (!isLegalResult) {
                // todo hash 确认失败，需要重新转账
                logger.debug('hash 确认失败，需要重新转账：', eth_txid);
                // await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                continue;
            }
            const ethCheckKey = `usdt_to_ue:${transaction.id}`;
            logger.debug('redis Key :', ethCheckKey);
            const isEx = await redis.get(ethCheckKey);
            if (isEx) {
                logger.warn("USDT2UE 这笔交易已经转账, 交易信息为： ", JSON.stringify(transaction, null, 4));
                return;
            }
            const transaction_info = await getTransaction(eth_txid);
            logger.debug("transaction_info: ", JSON.stringify(transaction_info, null, 4));
            if (!transaction_info) {
                logger.debug('transaction_info === null ====> eth_id: ', eth_txid);
                continue;
            }
            const data = await parseTransaction(transaction_info);
            logger.debug("data: ", JSON.stringify(data, null, 4));

            if(!data) continue;
            data.ue_value = ue_value;
            data.pog_account = pog_account;
            data.id = transaction.id;
            //转账
            logger.debug("===== pub ====");
            await psTransfer2Pog.pub(data);
            await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
            logger.debug("===== pub end ====");
            await redis.set(ethCheckKey, 1);
        }
        return
    } catch (err) {
        await redis.del(INVEST_LOCK);
        logger.error('this error from handlerTransferActions(),the error trace is O%',err)
        throw err;
    }
}


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
         *  eth_confirm_blockNumber:Number|null,
         * }}
         */
        const data = {
            eth_txid : null,
            confirm_time :null,
            eth_blockNumber : null,
            eth_confirm_blockNumber :null
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


        
        const lastBlock = await getBlock();
        const eth_txid                = transaction_info.hash;
        const block_info              = await getBlock(transaction_info.blockNumber);
        const eth_blockNumber         = parseInt(transaction_info.blockNumber);
        const eth_confirm_blockNumber = eth_blockNumber+6;
        const confirm_time            = new Date(block_info.timestamp*1000);

        //不满足6次确认也先放着 
        if(eth_blockNumber>lastBlock){
            logger.debug(`not enough to 6 confirm!`)
            return false
        } 

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