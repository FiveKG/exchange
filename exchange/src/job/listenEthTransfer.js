// @ts-check
const logger = require("../common/logger.js").getLogger("listenTransfer.js")

const { redis } = require("../common");
const { EOS_TOKEN, TBG_TOKEN, BASE_AMOUNT, UE_TOKEN,BANKER } = require("../common/constant/eosConstants.js");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const {getCurrentTransaction} = require("./getEthTrxAction")
const EXCHANGE = "tbg:exchange:account_action_seq";
logger.debug(`handlerTransferActions running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange`;
let count = 1;
scheduleJob("*/1 * * * * *", begin);
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
        const actionSeq = await getLastPos(); //获取上次扫描位置

        const transfer_info = await getCurrentTransaction(1)
        console.log('=====================>',transfer_info)
        // const actions = await getEOSTrxAction(BANKER, actionSeq);
        // // logger.debug("actionSeq: ", actionSeq);
        // for (const action of actions) {
        //     const result = await parseEosAccountAction(action);
        //     const trxSeq = await redis.get(`tbg:exchange:trx:${ result.account_action_seq }`);

        //     // 如果处理过或者返回条件不符，直接更新状态，继续处理下一个
        //     if (trxSeq || !result.game_name || !result.account_name || !result.bet_num || !result.amount || !result.pay_type) {
        //         await setLastPos(result.account_action_seq);
        //         continue;
        //     }
        //     //投注处理
        //     const betData = {
        //         account_name : result.from,
        //         bet_num      : result.bet_num,
        //         bet_amount   : result.amount,
        //         odds_rate    : result.odds_rate,
        //         pay_type     : result.pay_type,
        //         agent_account: result.from
        //     }
        //     //下注
        //     //console.log('=========>',betData)

        //     //await handlerBet(betData)
        //     await redis.set(`tbg:exchange:trx:${ result.account_action_seq }`, result.trx_id);
        //     await setLastPos(result.account_action_seq);
        // }
        await redis.del(INVEST_LOCK);
    } catch (err) {
        throw err;
    }
}

/**
 * 
 * @param { any } action 
 */
async function parseEosAccountAction(action) {
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
            "game_name"         : "",
            "account_name"      : "",
            "bet_num"           : "",
            "pay_type"          : "UE_current",
            "odds_rate"         : ""
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
        let isTransfer = (act.account === UE_TOKEN || act.account === TBG_TOKEN) && act.name === "transfer"
        if (!isTransfer) {
            // todo
            // 调用的不是 EOS 或代币的转账方法
            logger.debug("The transfer method that is not called UE or HGB");
            return result;
        }
        let { from, to, quantity, memo } = act.data;
        if (to !== BANKER) {
            // todo
            // 收款帐号不符
            logger.debug(`receipt receiver does not match, ${ to } !== ${ BANKER }`);
            return result;
        }
        result["from"] = from;

        let [game_name, account_name, bet_num,odds_rate ] = memo.split(":");
        if (!game_name && !account_name && !bet_num && !odds_rate) {
            logger.debug("invalid memo, memo must be include game_name, account_name, bet_key, bet_num, bet_amount, periods, bet_type format like 'game_name:account_name:bet_key:bet_num:bet_amount:periods:bet_type'")
            return result;
        } 
        if (game_name !== "exchange") {
            // todo
            // memo 格式不符
            logger.debug(`invalid memo, ${ game_name } !== "exchange"`);
            return result;
        }
        let [ amount, symbol ] = quantity.split(" ");
        if (symbol === "UE" ) {
            if (new  Decimal(amount).greaterThanOrEqualTo(BASE_AMOUNT)) {
                // todo
                // 转帐额度不符
                logger.debug(`invalid quantity, amount must be less than ${ BASE_AMOUNT }, but get ${ amount }`);
                return result;
            }
            result.amount       = new Decimal(amount).toFixed(4);
            result.symbol       = symbol;
            result.game_name    = game_name;
            result.account_name = account_name;
            result.bet_num      = bet_num;
            result.odds_rate    = odds_rate;

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

async function getLastPos(){    
    let lastPosStr = await redis.get(EXCHANGE);
    if(!lastPosStr){
        await redis.set(EXCHANGE, 0);
        return 0;
    }
    return parseInt(lastPosStr) + 1;
}

/**
 * 设置收款账户 action 的最新的位置.
 * @param { number } seq
 */
async function setLastPos(seq){
    await redis.set(EXCHANGE , seq);
}

module.exports = handlerTransferActions;