//@ts-check
const {PROVIDER,CONTRACT_ADDRESS,COLD_ADDRESS1,COLD_ADDRESS2,COLD_ADDRESS3,COLD_ADDRESS4,COLD_ADDRESS5,HOT_ADDRESS,ABI} = require("../common/constant/web3Config");
const {HOT_ADDRESS_MAX,HOT_ADDRESS_MIN} = require('../common/constant/exchange_rule');
const {Decimal} = require("Decimal.js");
const {sequelize} = require('../db');
const sleep = require("./sleep");
const Web3 = require('web3');
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'http://localhost:8545');
const logger = require("../common/logger").getLogger('getEthTrxAction.js')
const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)

/**
 * //不指定区块默认区块号是最新区块号,指定区块号则返回该区块号的信息
 * @param  {Number|null} block_number
 * @returns {Promise<Object|Number>} 
 */
async function getBlock(block_number=null){
    try{
        if(!block_number){
            //不指定区块
            block_number = await web3.eth.getBlockNumber()
            return block_number
        }
        //指定区块号
        const block_info = await  web3.eth.getBlock(block_number)
        return block_info
    }
    catch(err){
        logger.error('the error from getBlock(),the error stock is %O',err)
        throw err
    }
}

/**
 * 返回以太坊燃气值余额，单位Gwei
 * @param {String} eth_address 
 */
async function getEthBalance(eth_address){
    const gas_wei = await web3.eth.getBalance(eth_address);
    const gas_Gwei =await web3.utils.fromWei(gas_wei,'Gwei');
    return gas_Gwei
}

/**
 * @param {String} txHash
 * @returns {Promise<{
* blockHash  : String|null,
* blockNumber: Number|null,
* from       : String|null,
* gas        : Number|null,
* gasPrice   : String|null,
* hash       : String|null,
* to         : String|null,
* value      : String|null          
 * }>}  获取以太坊交易数据
 */
async function getTransaction(txHash){

    try{
        const Transaction_info = await web3.eth.getTransaction(txHash);
        /**
         * @type {{
         * blockHash  : String|null,
         * blockNumber: Number|null,
         * from       : String|null,
         * gas        : Number|null,
         * gasPrice   : String|null,
         * hash       : String|null,
         * to         : String|null,
         * value      : String|null
         * }}
         */
        const transaction_info = {
            blockHash  : null,
            blockNumber: null,
            from       : null,
            gas        : null,
            gasPrice   : null,
            hash       : null,
            to         : null,
            value      : null,
        };
    
        transaction_info['blockHash']   = Transaction_info.blockHash;
        transaction_info['blockNumber'] = Transaction_info.blockNumber;
        transaction_info['from']        = Transaction_info.from;
        transaction_info['gas']         = Transaction_info.gas;
        transaction_info['gasPrice']    = Transaction_info.gasPrice;
        transaction_info['hash']        = Transaction_info.hash;
        transaction_info['to']          = Transaction_info.to;
        transaction_info['value']       = Transaction_info.value;

        return transaction_info
    }
    catch(err){
        logger.error('the error from getTransaction(),the error stock is %O',err)
        throw err
    }
}

/**
 * 查询合约账号的历史事件，每次查询一个区块的所有交易数据
 * @param {Number} fromBlock 从第几块区查起，默认是0
 * @returns {Promise<Array<Object>>} 交易对象数组
 */
async function getContractTransaction(fromBlock=0){
    try{
        const event = await contract.getPastEvents('Transfer',{
            fromBlock:fromBlock,
            toBlock: "latest"
        })
        return event

    }catch(err)
    {
        logger.error("err from getContractTransaction(),ths track is %O:",err)
        throw err
    }
}


/**
 * 返回该eth账号的合约余额
 * @param {String} eth_account 
 * @returns {Promise<String>}
 */
async function getTokenBalance(eth_account){
    try{
        const balance = await contract.methods.balanceOf(eth_account).call();
        return balance;
    }
    catch(err){
        logger.error("err from getTokenBalance(),ths track is %O:",err);
        throw err
    }
}

/**
 * 估算本次转账会用到多少燃气，单位wei
 * @param {String} eth_account_from 
 * @param {String} eth_account_to
 * @param {String} transfer_amount 
 * @returns {Promise<String>} 花费燃气值，单位Gwei
 */
// @ts-ignore
async function estimateGas(eth_account_from,eth_account_to,transfer_amount){
    try{
        const gas = (await contract.methods.transfer(eth_account_to,transfer_amount).estimateGas({from:eth_account_from})).toString()

        return web3.utils.fromWei(gas,'Gwei')
    }
    catch(err){
        logger.error("err from estimateGas(),ths track is %O:",err);
        throw err
    }
}

/**
 * 
 * @param {String} transfer_amount 转账金额
 * @returns {Promise<String>} 返回接受收款地址
 */
// @ts-ignore
async function acceptTransferEthAccount(transfer_amount){
    try{
        const hot_address_balance_eth = new Decimal(await getTokenBalance(HOT_ADDRESS))
        const hot_address_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:HOT_ADDRESS,
            is_exchanged:false
        }})
        const hot_address_balance = hot_address_balance_eth.add(hot_address_balance_sql);
        //判断热钱包
        if(hot_address_balance.lessThan(HOT_ADDRESS_MIN)){
            if(hot_address_balance.add(transfer_amount).lessThan(HOT_ADDRESS_MAX)){
                return HOT_ADDRESS;
            }
        }
        //console.log(`hot_address_balance_sql:${hot_address_balance_sql},hot_address_balance_sql:${hot_address_balance_sql},total:${hot_address_balance}`)

        const address2balance = {}
        const cold_address1_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS1));
        const cold_address1_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:COLD_ADDRESS1,
            is_exchanged:false
        }})
        const cold_address1_balance = cold_address1_balance_eth.add(cold_address1_balance_sql);
        //console.log(`cold_address1_balance_eth:${cold_address1_balance_eth},cold_address1_balance_eth:${cold_address1_balance_sql},total:${cold_address1_balance}`)

        const cold_address2_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS2));
        const cold_address2_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:COLD_ADDRESS2,
            is_exchanged:false
        }})
        const cold_address2_balance = cold_address2_balance_eth.add(cold_address2_balance_sql);
        //console.log(`cold_address2_balance_eth:${cold_address2_balance_eth},cold_address2_balance_sql:${cold_address2_balance_sql},total:${cold_address2_balance}`)

        const cold_address3_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS3));
        const cold_address3_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:COLD_ADDRESS3,
            is_exchanged:false
        }})
        const cold_address3_balance = cold_address3_balance_eth.add(cold_address3_balance_sql);
       // console.log(`cold_address3_balance_eth:${cold_address3_balance_eth},cold_address3_balance_sql:${cold_address3_balance_sql},total:${cold_address3_balance}`)

        const cold_address4_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS4));
        const cold_address4_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:COLD_ADDRESS4,
            is_exchanged:false
        }})
        const cold_address4_balance = cold_address4_balance_eth.add(cold_address4_balance_sql);
        //console.log(`cold_address4_balance_eth:${cold_address4_balance_eth},cold_address4_balance_sql:${cold_address4_balance_sql},total:${cold_address4_balance}`)

        const cold_address5_balance_eth = new Decimal(await getTokenBalance(COLD_ADDRESS5));
        const cold_address5_balance_sql = await sequelize.Eth_charge.sum('usdt_value',{where:{
            to_eth_address:COLD_ADDRESS5,
            is_exchanged:false
        }})
        const cold_address5_balance = cold_address5_balance_eth.add(cold_address5_balance_sql);
        //console.log(`cold_address5_balance_eth:${cold_address5_balance_eth},cold_address5_balance_sql:${cold_address5_balance_sql},total:${cold_address5_balance}`)

        // @ts-ignore
        address2balance[cold_address1_balance] = COLD_ADDRESS1;
        // @ts-ignore
        address2balance[cold_address2_balance] = COLD_ADDRESS2;
        // @ts-ignore
        address2balance[cold_address3_balance] = COLD_ADDRESS3;
        // @ts-ignore
        address2balance[cold_address4_balance] = COLD_ADDRESS4;
        // @ts-ignore
        address2balance[cold_address5_balance] = COLD_ADDRESS5;

        const min = Decimal.min(cold_address1_balance,cold_address2_balance,cold_address3_balance,cold_address4_balance,cold_address5_balance);
        // @ts-ignore
        return address2balance[min.toString()]
    }catch(err){
        logger.error("err from acceptTransferEthAccount(),ths track is %O:",err);
        throw err
    }
}

/**
 * 
 * @param {String} eth_account_from 
 * @param {String} transfer_amount 
 */
async function getAddressAndEstimateGas(eth_account_from,transfer_amount){
    const transfer_to_address = await acceptTransferEthAccount(transfer_amount);
    const estimate_gas_Gwei = await estimateGas(eth_account_from,transfer_to_address,transfer_amount);
    const gas_Gwei_balance = await getEthBalance(eth_account_from);
    const usdt_balance = await getTokenBalance(eth_account_from);
    return {transfer_to_address,estimate_gas_Gwei,gas_Gwei_balance,usdt_balance}
}
/**
 * 判断是否6次确认
 * @param {String} txHash 
 * @returns {Promise<boolean>}
 */
async function is6confirm(txHash){
    try{
        const trx = await web3.eth.getTransaction(txHash)
        if(!trx){
            return false
        }
        while(1){
            const latest_block =  await getBlock();
            if((latest_block-trx.blockNumber)>=6){
                if(trx){
                    return true
                }
                break
            }
            logger.error(`等待交易号:${txHash}确认，该区号为：${trx.blockNumber},目前区块号为:${latest_block}`)
            await sleep(1000)
        }
        return false
    }
    catch(err){
        logger.error("err from is6confirm(),ths track is %O:",err);
        throw err
    }
}

module.exports={
    "getBlock"                : getBlock,
    "getTransaction"          : getTransaction,
    "getContractTransaction"  : getContractTransaction,
    "getTokenBalance"         : getTokenBalance,
    "is6confirm"              : is6confirm,
    "acceptTransferEthAccount": acceptTransferEthAccount,
    "estimateGas"             : estimateGas,
    "getEthBalance"           : getEthBalance
}