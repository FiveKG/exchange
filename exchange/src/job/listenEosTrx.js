//@ts-check
const logger = require("../common/logger.js").getLogger("listenEosTransfer.js")
const { scheduleJob } = require("node-schedule");
const { redis,generate_unique_key } = require("../common");
const { getTrxInfoByBlockNumber,getTransactionInfo } = require("./getEOSTrxAction")
const { Decimal } = require("decimal.js");
const {sequelize,psTransfer2Eth} = require('../db');
const {EXPIRATION_HOUR} = require("../common/constant/exchange_rule")
const {UE_CONTRACT,UE_TOKEN2,TBG_TOKEN2} = require('../common/constant/eosConstants')
const LOCK_ETH_TRANSFER = "tgb:exchange:lockEthTransfer:from:"
const {HOT_ADDRESS} = require('../common/constant/web3Config')


logger.debug(`handlerTransferActions EOS running...`);

// 每秒中执行一次,有可能上一条监听的还没有执行完毕,下一次监听又再执行了一次,从而造成多条数据重复
const INVEST_LOCK = `tbg:lock:exchange:Eos`;
let count = 1;
scheduleJob("*/10 * * * * *", begin);
// 如果中途断开，再次启动时计数到 10 以后清除缓存
async function begin() {
    try {
        await redis.del(LOCK_ETH_TRANSFER+HOT_ADDRESS);
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
        const now = new Date();
    //从数据库获取没有完成的交易
    const sql_transactions_id = await sequelize.Eth_charge.findAll({
        where:{is_exchanged:false,log_info:'UE2USDT'},
        attributes:["id"],
        raw: true,
    });

    //@ts-ignore
    const id_array= sql_transactions_id.map(element=>{
        return element.id
    })
    while(1){
        const new_array = id_array.splice(0,10);
        if(new_array.length===0)break
        const sql_transactions = await sequelize.Eth_charge.findAll({
            where:{id:new_array},
            attributes:["pog_txid",'recharge_time','pog_blockNumber'],
            order:[['recharge_time','DESC']],
            raw: true,
        });

        const minute = 1000 * 60;
        const hour = minute * 60;
        for(const transaction of sql_transactions){
            const pog_txid      = transaction.pog_txid;
            const recharge_time = new Date(transaction.recharge_time);
            const pog_blockNumber = transaction.pog_blockNumber;
            const h =( now.getTime() - recharge_time.getTime())/hour;
            
            if(h>=EXPIRATION_HOUR)
            {
                logger.debug(`${pog_txid} is over to 24hr,delete it!`)
                await sequelize.Eth_charge.destroy({
                    where: {pog_txid:pog_txid}
                })
                continue
            }

            //从链上获取交易信息进行解析
            const transaction_info = await getTransactionInfo(pog_blockNumber,pog_txid);
            const data = await  parseEosAccountAction(transaction_info);
            data.pog_txid = pog_txid
            if(!data) continue
            
            if(await redis.get(LOCK_ETH_TRANSFER+HOT_ADDRESS)){
                return
            }
            //转账
            await psTransfer2Eth.pub(data)
        }
    }

    await redis.del(INVEST_LOCK);
    return
    }catch(err){
        logger.error('this error from handlerTransferActions(),the error trace is O%',err);
        throw err
    }
}
/**
 * @param {Object} transaction_info
 * @returns {Promise<Object>}
 */
async function parseEosAccountAction(transaction_info){
    try {

        if(!transaction_info||transaction_info.status!=='executed'){
            logger.debug(`error:action:${transaction_info},action.status:${transaction_info.status}`);
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
                logger.debug(`error:UE_CONTRACT:${action.account}`);
                continue
            }
            if(action.name !=="transfer"){
                logger.debug(`error:action.name is not transfer:${action.name}`);
                continue
            }
            if(action.data.to!==UE_TOKEN2){
                logger.debug(`error:transfer to unknown pog_account :${action.data.to}`);
                continue
            }
            const [quantity,symbol] = action.data.quantity.split(' ');
            if(symbol!=='UE'){
                logger.debug(`error:symbol not UE :${symbol}`);
                continue
            }
            const [memo_name,to_eth_address] = action.data.memo.split(':');
            
            action_data.to_eth_address = to_eth_address;
            action_data.quantity       = action_data.quantity.add(quantity);
        }
        return action_data
    }catch(err){
        logger.error('this error from parseEosAccountAction(),the error trace is O%',err);
        throw err
    }
}

