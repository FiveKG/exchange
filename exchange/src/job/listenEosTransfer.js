//@ts-check
const logger = require("../common/logger.js").getLogger("listenEosTransfer.js")
const { scheduleJob } = require("node-schedule");
const { redis,generate_unique_key } = require("../common");
const { getTrxInfoByBlockNumber } = require("./getEOSTrxAction")
const { Decimal } = require("decimal.js");
const {sequelize} = require('../db');
const {UE_TOKEN,TBG_TOKEN,TBG_TOKEN2,BASE_AMOUNT} = require('../common/constant/eosConstants')
const BLOCK_NUMBER = "tbg:exchange:Eos:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eos:tx_number"
logger.debug(`handlerTransferActions EOS running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eos`;
let count = 1;
scheduleJob("*/ * * * * *", begin);
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
    try{
        await redis.set(INVEST_LOCK, 1);

        let lastBlockNumber = await getLastTxNumber(); //获取上次扫描位置
        console.log(lastBlockNumber)
        let actions = await getTrxInfoByBlockNumber(UE_TOKEN,lastBlockNumber)
        for(const action of actions){
            //const result = await parseEosAccountAction(action);
            
            logger.warn(`<==========处理交易号是：${action.account_action_seq}`)
            console.log(action.action_trace.act.data)
        }

        await redis.del(INVEST_LOCK);
        return
    }catch(err){

    }
}
/**
 * @param {Object} action
 */
async function parseEosAccountAction(action){
    try {
        let result = {
            "global_action_seq" : action.global_action_seq,
            "account_action_seq": action.account_action_seq,
            "block_num"         : action.block_num,
            "block_time"        : action.block_time,
            "trx_id"            : "",
            "amount"            : "",
            "from"              : "",
            "symbol"            : "",
            "operation"         : "",
            "account_name"      : "",
            "transfer_amount"   : "",
            "pay_type"          : "UE_current",
        }
        let actionTrace = action.action_trace;
        if (!actionTrace) {
            // todo
            logger.debug("actionTrace is null");
            return result;
        }
        if (!actionTrace.receipt) {
            // todo
            logger.debug("actionTrace.receipt is null");
            return result;
        }
        if (!actionTrace.act) {
            // todo
            logger.debug("actionTrace.act is null");
            return result;
        }
        if (!actionTrace.trx_id) {
            // todo
            logger.debug("actionTrace.trx_id is null");
            return result;
        }
        result["trx_id"] = actionTrace.trx_id;
        logger.debug(`trx_id: ${ actionTrace.trx_id } -- account_action_seq: ${ action.account_action_seq }`);
        let { receipt, act } = actionTrace;
        // logger.debug("act: ", act);
        let isTransfer = (act.account === UE_TOKEN ) && act.name === "transfer"
        if (!isTransfer) {
            // todo
            // 调用的不是 EOS 或代币的转账方法
            logger.debug("The transfer method that is not called UE or HGB");
            return result;
        }
        let { from, to, quantity, memo } = act.data;
        if (to !== UE_TOKEN) {
            // todo
            // 收款帐号不符
            logger.debug(`receipt receiver does not match, ${ to } !== ${ UE_TOKEN }`);
            return result;
        }
        result["from"] = from;

        let [operation, account_name, transfer_amount ] = memo.split(":");
        if (!operation && !account_name && !transfer_amount) {
            logger.debug("invalid memo, memo must be include game_name, account_name, bet_key, bet_num, bet_amount, periods, bet_type format like 'game_name:account_name:bet_key:bet_num:bet_amount:periods:bet_type'")
            return result;
        } 
        if (operation !== "Pog2Eth") {
            // todo
            // memo 格式不符
            logger.debug(`invalid memo, ${ operation } !== "Pog2Eth"`);
            return result;
        }
        let [ amount, symbol ] = quantity.split(" ");
        if (symbol === "UE" ) {
            if (new  Decimal(amount).lessThanOrEqualTo(BASE_AMOUNT)) {
                // todo
                // 转帐额度不符
                logger.debug(`invalid quantity, amount must be greater than ${ BASE_AMOUNT }, but get ${ amount }`);
                return result;
            }
            result.amount       = new Decimal(amount).toFixed(4);
            result.symbol       = symbol;
            result.operation    = operation;
            result.account_name = account_name;
            result.transfer_amount      = transfer_amount;

            return result;
        } else {
            // todo
            // 代币符号不符
            logger.debug("invalid asset symbol, symbol must be UE or TBG");
            return result;
        }
    } catch (err) {
        throw err;
    }
}
async function getLastTxNumber(){    
    let lastPosStr = await redis.get(BLOCK_NUMBER);
    if(!lastPosStr){
        await redis.set(BLOCK_NUMBER, 0);
        return 0;
    }
    return parseInt(lastPosStr) + 1;
}

/**
 * 设置收款账户 action 的最新的位置.
 * @param { number } seq
 */
async function setLastTxNumber(seq){
    await redis.set(BLOCK_NUMBER , seq);
}


//test()
handlerTransferActions()