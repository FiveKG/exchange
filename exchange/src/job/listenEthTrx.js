// @ts-check
const logger = require("../common/logger.js").getLogger("listenEthTrx.js")
const { redis,generate_unique_key } = require("../common");
const { Decimal } = require("decimal.js");
const { scheduleJob } = require("node-schedule");
const { BASE_AMOUNT,UE2USDT_RATE} = require("../common/constant/exchange_rule")
const {getBlock} = require("./getEthTrxAction")
const {ADDRESSES} = require("../common/constant/web3Config")
const BLOCK_NUMBER = "tbg:exchange:Eth:lastBlockNumber";
const TX_NUMBER = "tgb:exchange:Eth:tx_number"
const {sequelize,psTransfer2Pog} = require('../db')
logger.debug(`handlerTransferActions running...`);
// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eth`;
let count = 1;
scheduleJob("*/3 * * * * *", begin);
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

        const lastBlockNumber = await getBlock();
        const blockInfo = await getBlock(lastBlockNumber);

        

            for (const action of actions) {
            let lastBlockNumber2 = await getLastBlockNumber(); //获取上次处理好的扫描位置
            const LastTxNumber = await getLastTxNumber();
            //如果是处理过的交易
            if(action.blockNumber==lastBlockNumber2&&action.transactionIndex<=LastTxNumber){
                continue;
            }

            const result = await parseContractAction(action);
            // 如果返回条件不符，直接更新状态，继续处理下一个
            if (result.blockNumber==='pending' ||  !result.usdt_value || !result.from_eth_address || !result.to_eth_address || !result.event ) {
                logger.debug("wrong result",result)
                continue;
            }
            
            logger.warn(`<==========处理交易区块号是：${action.blockNumber}=========>,<==========该区块的交易索引：${action.transactionIndex}=========>`)

            //整理数据
            let defaults = {
                id              : generate_unique_key(),
                eth_txid        : result.eth_txid,
                from_eth_address: result.from_eth_address,
                to_eth_address  : result.to_eth_address,
                usdt_value      : result.usdt_value,
                ue_value        : result.ue_value,
                recharge_time   : new Date(),
                confirm_time    : null,
                exchange_time   : null,
                is_exchanged    : false,
                eth_blockNumber : result.blockNumber,
                pog_blockNumber : null,
                pog_account     : result.pog_account,
                pog_txid        : null,
                log_info        : 'Eth2Pog'
            };
            //插入数据库
            try{
                let sql_result = await sequelize.Eth_charge.findCreateFind({
                    where:{"eth_txid":result.eth_txid},
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


handlerTransferActions()
/**
 * 
 * @param {Object} action  某一记录
 * @returns {Promise<Object>} 解析后的数据
 */
async function parseContractAction(action){
    try{
        /**
         * @type {{
         * blockNumber     : Number|null,
         * transactionIndex: String|null,
         * eth_txid        : String|null,
         * from_eth_address: String|null,
         * to_eth_address  : String|null,
         * pog_account     : String|null
         * usdt_value      : Decimal|null,
         * ue_value        : Decimal|null,
         * event           : String|null
         * }}
         */
        let result = {
            "blockNumber"     : null,
            "transactionIndex": null,
            "eth_txid"        : null,
            "from_eth_address": null,
            "to_eth_address"  : null,
            "pog_account"     : null,
            "usdt_value"      : null,
            "ue_value"        : null,
            "event"           : null
        }

        //blockNumber
        let blockNumber = action.blockNumber;
        if(blockNumber===null){
            logger.warn("warn from parseContractAction():if(blockNumber===null),the blockNumber is pending,so blockNumber is null");
            blockNumber = 'pending';
            return result
        }

        //transactionIndex
        let transactionIndex = action.transactionIndex;
        if(parseInt(transactionIndex).toString() == "NaN"){
            logger.warn("warn from parseContractAction():if((parseInt(transactionIndex).toString() == 'NaN')");
            return result
        }

        //eth_txid
        let eth_txid = action.transactionHash;

        //from_eth_address
        let from_eth_address = action.returnValues._from;

        //to_eth_address
        let to_eth_address = action.returnValues._to;

        //pog_account
        let pog_account_obj = await sequelize.Eth_account.findOne({
            where:{'eth_address':to_eth_address},
            attributes: ['pog_account']
        })
        if(!pog_account_obj){
            to_eth_address = null;
            logger.warn("warn from parseContractAction(): if(!account),the account is null,the database not exist this account");
            return result
        }else if(pog_account_obj.dataValues==ACC0||pog_account_obj.dataValues==ACC1||pog_account_obj.dataValues==ACC2){
            to_eth_address = null;
            logger.warn("warn from parseContractAction(): if(!account),the account is *********ACC0,ACC1,ACC2*********");
            return result
        }
        let pog_account = pog_account_obj.dataValues.pog_account;

        //usdt_value
        let usdt_value = new Decimal(action.returnValues._value)
        if(parseInt(action.returnValues._to).toString() == "NaN"){
            logger.warn("warn from parseContractAction():if(parseInt(action.returnValues._to).toString() == 'NaN'), the value is not a number");
            return result
        }
        if(usdt_value.lessThan(BASE_AMOUNT)){
            logger.warn("warn from parseContractAction():if(usdt_value.lessThan(BASE_AMOUNT)), the value is wrong");
            return result
        };

        //ue_value
        let ue_value =await Usdt2Ue(new Decimal(usdt_value));

        //event
        let event = action.event
        if(event !== 'Transfer'){
            logger.warn("warn from parseContractAction():if(event !== 'Transfer'), the event value is not 'Transfer'");
            return result
        };

        result.blockNumber      = blockNumber;
        result.transactionIndex = transactionIndex;
        result.eth_txid         = eth_txid;
        result.from_eth_address = from_eth_address;
        result.to_eth_address   = to_eth_address ;
        result.usdt_value       = usdt_value;
        result.pog_account      = pog_account;
        result.ue_value         = ue_value;
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
    //兑换比例；保留8位小数点，向下四舍五入
    let value = amount.mul(UE2USDT_RATE).toDecimalPlaces(8, Decimal.ROUND_DOWN)
    return value
}


module.exports = handlerTransferActions;