// @ts-check
const { Api, JsonRpc,RpcError } = require('eosjs');
const logger = require("../common/logger").getLogger('getEOSTrxAction.js')
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch');                                // node only
const { TextDecoder, TextEncoder } = require('util');               // node only
const { END_POINT,PRIVATE_KEY_TEST,UE_TOKEN_SYMBOL,UE_TOKEN,UE_CONTRACT } = require("../common/constant/eosConstants.js");
const sleep = require("./sleep.js");

// @ts-ignore
const rpc = new JsonRpc(END_POINT, { fetch });

const request = require("request");

/**
 * 异步请求方法
 * @param {Object} options 配置项
 * @returns {Promise}
 */
async function asyncRequest(options) {
    return new Promise((resolve, reject) => {
        //@ts-ignore
        request(options, (err, res, body) => {
        if (err) {
            return reject(err);
        }
        resolve(body);
        });
    });
}
  
/**
 * POST方式请求
 * @param {String} api_url 接口URL
 * @param {Option} [options] 配置项
 * @returns {Promise<Object>}
 */
async function post(api_url, options = {}) {
    try {
        const req_options = {
        uri: api_url,
        method: "post",
        json: true,
        headers: options.headers || {},
        body: options.data || {}
        };
    
        return await asyncRequest(req_options);
    } catch (err) {
        throw err;
    }
}


/**
 * @description 配置项
 * @typedef {Object} Option
 * @property {Object} [headers] 请求头
 * @property {Object} [data] 请求参数
 */
  
  
/**
 * 从链上获取 指定用户，在指定位置开始的10条 action (转账) 记录
 * @param {string} accountName 账户名称.应为 系统的收款账户
 * @param {number} fromPosition 起始位置
 */
async function getTrxAction(accountName, fromPosition) {
    try {
        const opts = {
            "pos": fromPosition,
            "offset": 9,
            "account_name": accountName
        }
        const url = `${ END_POINT }/v1/history/get_actions`
        const result = await post(url, { data: opts });
        let actions = result.actions;
        return actions;
    } catch (err) {
        throw err;
    }
}

/**
 * 返回指定交易id的信息
 * @param {String} txid 
 * @param {Number} blockNumber
 * @returns {Promise<Object>}
 */
async function getTransactionInfo(blockNumber,txid){
    try{
        const block_info = await rpc.get_block(blockNumber)
        //@ts-ignore
        const trx_info = block_info.transactions.find(transaction=>{
            return transaction.trx.id==txid
        })
        return trx_info
    }
    catch (err) {
        throw err;
    }
}

/**
 * 
 * @param {Number|null} blockNumber 
 * @returns {Promise<{
 *  expiration:String,
 *  pog_txtid:String,
 *  actions:Array<Object>
 * }>}
 */
async function getTrxInfoByBlockNumber(blockNumber=0){
    try{
        const block_info = await rpc.get_block(18868288)
        //@ts-ignore
        let info = block_info.transactions.map(t=>{
            let trx_info = {
                "expiration":"",
                "pog_txtid":"",
                "actions":null
            }
            let trx = t.trx;
            trx_info.pog_txtid= trx.id;
    
            let transaction = trx.transaction;
            trx_info.expiration = transaction.expiration;
            //@ts-ignore
            trx_info.actions = transaction.actions.filter(action=>action.name=="transfer")
            return trx_info
        })

        return info
    }
    catch(err){
        throw err;
    }
}
// /**
//  * 
//  * @param { string } accountName 
//  * @param { number } actionSeq 
//  */
// async function getTrxAction(accountName, actionSeq) {
//     try {
//         // @ts-ignore
//         const resp = await rpc.history_get_actions(accountName, actionSeq, 9);
//         // console.debug("resp: ", resp.actions);
//         return resp.actions;
//     } catch (err) {
//         throw err;
//     }
// }

/**
 * 获取代币发行信息
 * @param { string } code 代币合约
 * @param { string } symbol 代币符号
 */
async function getCurrencyStats(code, symbol) {
    try {
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        const resp = await rpc.get_currency_stats(code, symbol);
        // const { [TBG_TOKEN_SYMBOL]: { max_supply: maxSupply } } = resp;
        // console.debug("resp: ", resp);
        return resp;
    } catch (err) {
        throw err;
    }
}

/**
 * 获取用户代币资产
 * @param { string } account 账户名
 */
async function getCurrencyBalance(account) {
    try {
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        const balance = await rpc.get_currency_balance(UE_CONTRACT, account, UE_TOKEN_SYMBOL);
        // const { [TBG_TOKEN_SYMBOL]: { max_supply: maxSupply } } = resp;
        return balance;
    } catch (err) {
        throw err;
    }
}

/**
 * 获取用户代币资产
 * @param { string } transactionId 交易 id
 */
async function getTransaction(transactionId) {
    try {
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });


        const resp = rpc.history_get_transaction(transactionId);
        
        return resp;
    } catch (err) {
        throw err;
    }
}

/**
 * 
 * @param { String[] } privateKeyList 私钥数组
 */
async function newApi(privateKeyList) {
    try {
        const signatureProvider = new JsSignatureProvider(privateKeyList);
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        // @ts-ignore
        const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        return api;
    } catch (err) {
        throw err;
    }
}
/**
 * 转帐
 * @param {{  
    *     tokenContract : String,
    *     from          : String,
    *     to            : String,
    *     quantity      : String,
    *     memo          : String,
    *         }} transfer_data
    */
async function transfer(transfer_data) {
    try {
        const {tokenContract,from,to,quantity,memo} = transfer_data;
        let api = await newApi(PRIVATE_KEY_TEST.split(","));
        let actions = {
            actions: [{
              account: tokenContract,
              name: "transfer",
              authorization: [{
                actor: from,
                permission: 'active',
              }],
              data: {
                from: from,
                to: to,
                quantity: quantity,
                memo: memo,
              }
            }]
          }
        await sleep(5 * 500);
        const result = await api.transact(actions, {
            blocksBehind: 3,
            expireSeconds: 30,
        });
        return result;
 
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getTrxAction,
    getCurrencyStats,
    getCurrencyBalance,
    getTransaction,
    getTransactionInfo,
    transfer,
    getTrxInfoByBlockNumber,
    rpc
}