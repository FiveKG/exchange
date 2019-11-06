//@ts-check
const loggerDebug = require("../common/logger.js").getLogger(`${__filename}`)
const { scheduleJob } = require("node-schedule");
const { redis,generate_unique_key } = require("../common");
const { getTrxInfoByBlockNumber,getTransactionInfo } = require("./getEOSTrxAction")
const { Decimal } = require("decimal.js");
const {sequelize,psTransfer2Eth} = require('../db');
const {EXPIRATION_HOUR} = require("../common/constant/exchange_rule")
const {UE_CONTRACT,UE_TOKEN2,UE_TOKEN,TBG_TOKEN2} = require('../common/constant/eosConstants')
const LOCK_ETH_TRANSFER = "tgb:exchange:lockEthTransfer:from:"
const {HOT_ADDRESS} = require('../common/constant/web3Config')
const { differenceInHours } = require("date-fns");
const sleep = require("./sleep")
// logger.debug(`handlerTransferActions EOS running...`);


// scheduleJob("*/10 * * * * *", handlerTransferActions);

async function StartJob(){
    setTimeout(async function(){
        try {
          await  handlerTransferActions();
        } catch (error) {
            loggerDebug.error(`定时器层异常`, error);
        }
        await StartJob()
    }, 5000)
}
StartJob();


// 如果中途断开，再次启动时计数到 10 以后清除缓存

/**
 * 监听智能合约账号的转账记录
 */
async function handlerTransferActions() {
    
    try{
        // 
        await redis.del(`${LOCK_ETH_TRANSFER}${HOT_ADDRESS}`);
        const now = new Date();
        //从数据库获取没有完成的交易
        const unQueueAndUnExchangeOption = { 
            "attributes":[ "id", "pog_txid",'recharge_time','pog_blockNumber' ],
            "where" : {
                is_exchanged: false,
                log_info    : 'UE2USDT',
                is_queue    : false
            },
            limit: 1,
            order:[ [ 'recharge_time' , 'ASC' ]],
            "raw": true,
        };
        const sql_transactions = await sequelize.Eth_charge.findAll(unQueueAndUnExchangeOption);

        const minute = 1000 * 60;
        const hour = minute * 60;
        for(let transaction of sql_transactions){
            const logger = require("../common/logger.js").getLogger(`${transaction.pog_txid}`)
            try {
                logger.debug("数据库交易记录 transaction: ", JSON.stringify(transaction, null, 4));
                const pog_txid      = transaction.pog_txid;
                const recharge_time = new Date(transaction.recharge_time);
                const pog_blockNumber = transaction.pog_blockNumber;
                //const hourDifference = ( now.getTime() - recharge_time.getTime()) / hour;
                const hourDifference = differenceInHours(now  , recharge_time );
                //todo:  24 小时30分钟 怎么算 ？
                if(hourDifference >= EXPIRATION_HOUR) {
                    //超过24小时 未转账。不处理这个事务.
                    logger.debug(`${pog_txid} is over to 24hr , delete it!`);
                    await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                    // await sequelize.Eth_charge.destroy({
                    //     where: { pog_txid:pog_txid }
                    // });
                    continue;
                }

                //从链上获取交易信息进行解析
                logger.debug(" pog_blockNumber    : ", pog_blockNumber );
                const transaction_info = await getTransactionInfo(pog_blockNumber , pog_txid);
                logger.debug("从链上获取 pog 交易信息进行解析 transaction_info: ", JSON.stringify(transaction_info, null, 4));
                if (!transaction_info) {
                    continue;
                }

                const data = await parseEosAccountAction(transaction_info);
                logger.debug("action: ", JSON.stringify(data, null, 4));
                data.pog_txid = pog_txid;
                data.id = transaction.id;
                if(!data) continue; 
                if(!data.to_eth_address) {
                    logger.debug(`error:transfer to null eth address :${data.to_eth_address}`);
                    await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                    continue;
                }
                await sequelize.sequelize.query(`update Eth_charge set is_queue = true where id = '${transaction.id}'` , { type: sequelize.sequelize.QueryTypes.UPDATE});
                // 转账
                logger.debug("pub 转账 ===》: ");
                await psTransfer2Eth.pub(data);
                logger.debug("pub 转账 ===》 end: ");
                await sleep(5 * 1000);
            } catch (error) {
                logger.error("处理转帐消息出错: ", error, " 出错的 action 为: ", JSON.stringify(transaction, null, 4));
            }
            
        }

        return
    }catch(err){
        loggerDebug.error('this error from handlerTransferActions(),the error trace is O%',err);
        throw err
    }
}
/**
 * @param {Object} transaction_info
 * @returns {Promise<Object>}
 */
async function parseEosAccountAction(transaction_info){
    try {
        if(!transaction_info || (!!transaction_info && transaction_info.status !=='executed')){
            loggerDebug.debug(`error:action:${transaction_info}`);
            return false
        }

        const confirm_time = transaction_info.trx.transaction.expiration;
        let action_data = {
            confirm_time  : confirm_time,
            to_eth_address: '',
            quantity      : new Decimal(0)
        }

       // console.log('---------------------------------->',transaction_info.trx.transaction.actions)
        // //解析actions//block_info.transactions[0].trx.transaction.actions
        for(let action of transaction_info.trx.transaction.actions){

            if(action.account!==UE_CONTRACT){
                loggerDebug.debug(`error:UE_CONTRACT:${action.account}`);
                continue
            }
            if(action.name !=="transfer"){
                loggerDebug.debug(`error:action.name is not transfer:${action.name}`);
                continue
            }
            if(action.data.to!==UE_TOKEN2){
                loggerDebug.debug(`error:transfer to unknown eth address :${action.data.to}`);
                continue
            }
            const [quantity,symbol] = action.data.quantity.split(' ');
            if(symbol!=='UE'){
                loggerDebug.debug(`error:symbol not UE :${symbol}`);
                continue
            }
            const [memo_name,to_eth_address] = action.data.memo.split(':');
            
            action_data.to_eth_address = to_eth_address;
            action_data.quantity       = action_data.quantity.add(quantity);
        }

        return action_data
    }catch(err){
        loggerDebug.error('this error from parseEosAccountAction(),the error trace is O%',err);
        throw err
    }
}


