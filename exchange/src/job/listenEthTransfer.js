// @ts-check
const logger = require("../common/logger.js").getLogger("listenTransfer.js")
const { redis,getCurrentDate,generate_unique_key } = require("../common");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const {getContractTransaction} = require("./getEthTrxAction")
const {ACC0,ACC1,ACC2} = require("../common/constant/web3Config")
const BLOCK_NUMBER = "tbg:exchange:Eth:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eth:tx_number"
const {sequelize,psTransfer2Pog} = require('../db')
logger.debug(`handlerTransferActions running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eth`;
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

        let lastBlockNumber = await getLastBlockNumber(); //获取上次扫描位置
        const actions = await getContractTransaction(lastBlockNumber)

            for (const action of actions) {
            
            logger.warn(`<==========处理交易区块号是：${action.blockNumber}=========>,<==========该区块的交易索引：${action.transactionIndex}=========>`)
            let lastBlockNumber2 = await getLastBlockNumber(); //获取上次处理好的扫描位置
            const LastTxNumber = await getLastTxNumber();
            //如果是处理过的交易
            if(action.blockNumber==lastBlockNumber2&&action.transactionIndex<=LastTxNumber){
                continue;
            }

            const result = await parseContractAction(action);
            // 如果返回条件不符，直接更新状态，继续处理下一个
            if (result.blockNumber==='pending' ||  !result.value || !result.from || !result.to || !result.event ) {
                logger.debug("wrong result",result)
                continue;
            }

            //兑换
            let ue_value =await Usdt2Ue(new Decimal(result.value))
            let pog_account_obj = await sequelize.Eth_account.findOne({
                where:{'eth_address':result.to},
                attributes: ['pog_account']
            })
            let pog_account = pog_account_obj.dataValues.pog_account;
            //整理数据
            let defaults = {
                id             : generate_unique_key(),
                txid           : result.transactionId,
                from_address   : result.from,
                to_address     : result.to,
                token_value    : result.value,
                ue_value       : ue_value.toString(),
                recharge_time  : getCurrentDate(),
                confirm_time   : null,
                exchange_time  : null,
                is_exchanged   : false,
                eth_blockNumber: result.blockNumber,
                pog_blockNumber: null,
                pog_txtid      : null,
                pog_account    : pog_account,
                log_info       : ''
            };
            //插入数据库
            try{
                let sql_result = await sequelize.Eth_charge.findCreateFind({
                    where:{"txid":result.transactionId},
                    defaults:defaults,
                });
            }catch(err){
                logger.error('this error from handlerTransferActions->sequelize.Eth_charge.findCreateFind(),the error trace is %O',err);
                continue;
            }
            
            //传送至消息队列紧张POG转账
            await psTransfer2Pog.pub(defaults)
            await redis.set(TX_NUMBER,action.transactionIndex);
            await redis.set(BLOCK_NUMBER,action.blockNumber);

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
 * @param {Object} action  某一记录
 * @returns {Promise<Object>} 解析后的数据
 */
async function parseContractAction(action){
    try{
        /**
         * @type {{blockNumber:Number|null,
         * transactionIndex: String|null,
         * transactionId   : String|null,
         * from            : String|null,
         * to              : String|null,
         * value           : String|Number|null;
         * event           : String|null
         * }}
         */
        let result = {
            "blockNumber"     : null,
            "transactionIndex": null,
            "transactionId"   : null,
            "from"            : null,
            "to"              : null,
            "value"           : null,
            "event"           : null
        }
        let blockNumber = action.blockNumber;
        
        if(blockNumber===null){
            logger.warn("warn from parseContractAction():if(blockNumber===null),the blockNumber is pending,so blockNumber is null");
            blockNumber = 'pending';
            return result
        }
        let transactionIndex = action.transactionIndex;
        if(parseInt(transactionIndex).toString() == "NaN"){
            logger.warn("warn from parseContractAction():if((parseInt(transactionIndex).toString() == 'NaN')");
            return result
        }
        let transactionId = action.transactionHash;
        let from = action.returnValues._from;
        //查询充值对象是否是数据库的一个
        let to = action.returnValues._to.toLowerCase();
        let account = await sequelize.Eth_account.findOne({where:{eth_address:to}})
        if(!account){
            to = null;
            logger.warn("warn from parseContractAction(): if(!account),the account is null,the database not exist this account");
            return result
        }else if(account.dataValues==ACC0||account.dataValues==ACC1||account.dataValues==ACC2){
            to = null;
            logger.warn("warn from parseContractAction(): if(!account),the account is *********ACC0,ACC1,ACC2*********");
            return result
        }

        let value = new Decimal(action.returnValues._value)
        if(parseInt(action.returnValues._to).toString() == "NaN"){
            logger.warn("warn from parseContractAction():if(parseInt(action.returnValues._to).toString() == 'NaN'), the value is not a number");
            return result
        }
        if(value.isNegative() || value.isZero()){
            logger.warn("warn from parseContractAction():if(value.isNaN() || value.isNegative() || value.isZero()), the value is wrong");
            return result
        }
        let event = action.event
        if(event !== 'Transfer'){
            logger.warn("warn from parseContractAction():if(event !== 'Transfer'), the event value is not 'Transfer'");
            return result
        }
        result.blockNumber      = blockNumber;
        result.transactionIndex = transactionIndex;
        result.transactionId    = transactionId;
        result.from             = from;
        result.to               = to ;
        result.value            = value.toString();
        result.event            = event;

        return result
    }catch(err)
    {
        logger.error("this err from parseContractAction,ths track is %O",err)
        throw err
    }
}

/**
 * 获取最新区块号
 */
async function getLastBlockNumber(){
    let LastBlockNumber = await redis.get(BLOCK_NUMBER);
    //@ts-ignore
    if(parseInt(LastBlockNumber).toString() == "NaN"){
        await redis.set(BLOCK_NUMBER, 0);
        return 0;
    }
    //@ts-ignore
    return parseInt(LastBlockNumber) ;
}
/**
 * 获取该区块号下的交易id
 */
async function getLastTxNumber(){
    let LastTxNumber = await redis.get(TX_NUMBER)
    //@ts-ignore
    if(parseInt(LastTxNumber).toString() == "NaN"){

        await redis.set(TX_NUMBER, 0);
        return 0;
    }
    //@ts-ignore
    return parseInt(LastTxNumber) ;
}

/**
 * 
 * @param {Decimal} amount 
 */
async function Usdt2Ue(amount){
    //兑换比例；保留8位小数点，向下四舍五入，一共保留32未
    let value = amount.mul(1).toDecimalPlaces(8, Decimal.ROUND_DOWN)
    return value
}


module.exports = handlerTransferActions;