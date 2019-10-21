const {PROVIDER,CONTRACT_ADDRESS,ACC0,ACC1,ABI} = require("../common/constant/web3Config")
const Web3 = require('web3');
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'ws://localhost:8545');
const logger = require("../common/logger").getLogger('getPAXTrxAction.js')
const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)

/**
 * //不指定区块默认区块号是最新区块号,指定区块号则返回该区块号的信息
 * @param {Number|String|null} 
 * @returns {Object|Number} 
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
 * @returns {{
 * blockHash  : String,
 * blockNumber: Number,
 * from       : String,
 * gas        : Number,
 * gasPrice   : Number,
 * hash       : String,
 * to         : String,
 * value      : Number              
 * }}  获取以太坊交易数据
 */
async function getTransaction(block_transaction){

    try{
        const Transaction_info = await web3.eth.getTransaction(block_transaction);
        const transaction_info = {};
    
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
 * @param block_number 默认最新区块
 * @returns {{
 * blockHash  : String,
 * blockNumber: Number,
 * from       : String,
 * gas        : Number,
 * gasPrice   : Number,
 * hash       : String,
 * to         : String,
 * value      : Number              
 * }} 获取以太坊当前交易数据
 */
async function getCurrentTransaction(block_number = null){
    try{

        const block_info = await getBlock(block_number);
        const transaction = block_info.transactions.pop();
        const transaction_info =await getTransaction(transaction);

        return transaction_info
    }
    catch(err){
        logger.error('the error from getCurrentTransaction(),the error stock is %O',err)
        throw err
    }
}

/**
 * 查询合约账号的历史事件，每次查询一个区块的所有交易数据
 * @param {Number} fromBlock 从第几块区查起，默认是0
 * @returns {Array<Object>} 交易对象数组
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
        console.log("err from getContractTransaction(),ths track is %O:",err)
        throw err
    }
}
/**
 * 返回该eth账号的合约余额
 * @param {String} eth_account 
 * @returns {String}
 */
async function getTokenBalance(eth_account){
    try{
        const balance = await contract.methods.balanceOf(eth_account).call()
        return balance
    }
    catch(err){
        console.log("err from getTokenBalance(),ths track is %O:",err)
    }
}
module.exports={
    "getBlock":getBlock,
    "getTransaction":getTransaction,
    "getCurrentTransaction":getCurrentTransaction,
    "getContractTransaction":getContractTransaction,
    "getTokenBalance":getTokenBalance
}