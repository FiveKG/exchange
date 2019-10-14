// @ts-check
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch');                                // node only
const { TextDecoder, TextEncoder } = require('util');               // node only
const { END_POINT } = require("../common/constant/eosConstants.js");

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
 * @param { string } code 代币合约
 * @param { string } account 账户名
 * @param { string } [symbol] 代币符号
 */
async function getCurrencyBalance(code, account, symbol) {
    try {
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        const resp = await rpc.get_currency_balance(code, account, symbol);
        // const { [TBG_TOKEN_SYMBOL]: { max_supply: maxSupply } } = resp;
        return resp;
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
    


        const resp = rpc.history_get_transaction("d4688e098ce71b685fc1cdc80d33ecf7e87138aa6a90b495c3063c969816e834");
        
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
 * @param { String } tokenContract 代币合约用户
 * @param { String } from 转帐用户
 * @param { String } to 收款人
 * @param { String } quantity  额度
 * @param { String } memo 备注
 * @param { String[] } privateKeyList 私钥数组
 */
async function transfer(tokenContract, from, to, quantity, memo, privateKeyList) {
    try {
        let api = await newApi(privateKeyList);
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
    rpc
}