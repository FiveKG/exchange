const Web3 = require('web3');
const {PROVIDER} = require("../common/constant/web3Config")
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'http://localhost:8545');
const logger = require("../common/logger").getLogger('getPAXTrxAction.js')



/**
 * @returns {Object} 返回区块信息
 * {
    "number": 3,
    "hash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
    "parentHash": "0x2302e1c0b972d00932deb5dab9eb2982f570597d9d42504c05d9c2147eaf9c88",
    "nonce": "0xfb6e1a62d119228b",
    "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "transactionsRoot": "0x3a1b03875115b79539e5bd33fb00d8f7b7cd61929d5a3c574f507b8acf415bee",
    "stateRoot": "0xf1133199d44695dfa8fd1bcfe424d82854b5cebef75bddd7e40ea94cda515bcb",
    "miner": "0x8888f1f195afa192cfee860698584c030f4c9db1",
    "difficulty": '21345678965432',
    "totalDifficulty": '324567845321',
    "size": 616,
    "extraData": "0x",
    "gasLimit": 3141592,
    "gasUsed": 21662,
    "timestamp": 1429287689,
    "transactions": [
        "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b"
    ],
    "uncles": []
}
 */
async function getBlock(block_number=null){
    try{
        if(!block_number){
            //不指定区块默认区块号是最新区块号
            block_number = await web3.eth.getBlockNumber()
        }
        const block_info = await  web3.eth.getBlock(block_number)
        return block_info
    }
    catch(err){
        logger.error('the error from getBlock(),the error stock is %O',err)
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
    }
}

async function getContractTransaction(){

}

module.exports={
    "getBlock":getBlock,
    "getTransaction":getTransaction,
    "getCurrentTransaction":getCurrentTransaction,
    "getContractTransaction":getContractTransaction
}