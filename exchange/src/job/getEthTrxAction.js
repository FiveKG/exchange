//@ts-check
const {PROVIDER,CONTRACT_ADDRESS,ACC0,ACC1,ABI} = require("../common/constant/web3Config");
const sleep = require("./sleep");
const Web3 = require('web3');
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'ws://localhost:8545');
const logger = require("../common/logger").getLogger('getPAXTrxAction.js')
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
        console.log("err from getContractTransaction(),ths track is %O:",err)
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
        console.log("err from getTokenBalance(),ths track is %O:",err);
        throw err
    }
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
            console.log(`等待交易号:${txHash}确认，该区号为：${trx.blockNumber},目前区块号为:${latest_block}`)
            await sleep(1000)
        }
        return false
    }
    catch(err){
        console.log("err from is6confirm(),ths track is %O:",err);
        throw err
    }
}

module.exports={
    "getBlock"              : getBlock,
    "getTransaction"        : getTransaction,
    "getContractTransaction": getContractTransaction,
    "getTokenBalance"       : getTokenBalance,
    "is6confirm"            : is6confirm
}