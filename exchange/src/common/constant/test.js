// @ts-check
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch');                                // node only
const { TextDecoder, TextEncoder } = require('util');               // node only
const { scheduleJob } = require("node-schedule");
let network = {
    main_net: "https://nodes.get-scatter.com"
}
// 参与 TBG1 所需 UE 额度
const BASE_AMOUNT = "100";
// TBG1 收款账户
const WALLET_RECEIVER = "tbgjoin";
// TBG1 出款账户
const DISPENSE_ACCOUNT = "tbgjoin";
// EOS token 合约账户
const EOS_TOKEN = "eosio.token";
const EOS_TOKEN_SYMBOL = "EOS"
// UE token 合约账户
const UE_TOKEN = "uetokencoin";
const UE_TOKEN_SYMBOL = "UE"
// TBG token 合约账户
const TBG_TOKEN = "tbgtokencoin"
const TBG_TOKEN_SYMBOL = "TBG"

// 庄家
const BANKER = "dicebanker"

// 代投注账号(超级用户)
const AGENT_ACCOUNT = "eoshashdice"

// 哈希骰子帐号(超级用户)
const HASH_DICE_CONTRACT = "eoshashdice";
// 节点信息
const END_POINT = "http://45.251.109.187:8888"
// 私钥
const PRIVATE_KEY_TEST = "5J2GxxF4xCfAZjP9R26jwnVY8rp8FYqXRE1fJPq5KDMSxa5NRuW,5K3LFVo36rAYBuAGC1UQmrZtrtvLkuWVYQ6TyhzwBgB2DpHo4zB,5K56kFugCU8UwbREvaZ8DTnH45q1LCMCQwp6xRHTGmxZVpUxBtt,5Kd5ExHx2AZwcnfFsQwNuiMvbeZvk1WGBD1iyc4FjwT5WBmDEF6,5JrN9PmaBTuDuoDBhYPwVsBmjTwtdpeGg4LN1sTCzv8igZgtxrx,5JZH8pBYdr3yfZnDhPtZzu9437tRoUJVCny8DvtCx1kbBh6KqyW,5JSZgw2fuoeXLXzwoQyBJ3L9vwH7AoQxjwBQRar4G2jqXnfrSXW,5KSzppBW7LcwVQ4hA1AQP4vZYWq1uEv4EQnZ5yz1eu41eLgrLK2,5JRiAXpyd5TW5REvLYd35FkrJSMjFfiUtrwrCNpChHFMVNnRDwB,5JAW6eWS4ADjwCr76xCvmPefknzhFg33f4haL5dbuiB5WoW79tQ,5JiaokGm1A7kyLq92YrQjp42Fr7Vqs52NBquCYiuU8DxKURkhfu,5KbQQbR83HFMPPaKCY4GPVBtNZZW4t6nNxtPEWkVPUHMWxpQLzS,5K7h5xxZNCfq6ujRmLWgCHHQKf4gAuKYAU8yDFRDwvkAN3scPki,5K5sRqqp3XebvjMmK1TYBFiSAd6XbwLeJa9L3CxWBMiWcSGCsDG,5KNoQXeFJp47dbtyifcCjJuhXjYmNvWPVcWYsHJJWZ8h7zAd78h,5KQairxa939NMKHfuyQWw9tSaiSk4B787HEPvTvd1BzReANJECo,5KSzppBW7LcwVQ4hA1AQP4vZYWq1uEv4EQnZ5yz1eu41eLgrLK2,5JRiAXpyd5TW5REvLYd35FkrJSMjFfiUtrwrCNpChHFMVNnRDwB,5JAW6eWS4ADjwCr76xCvmPefknzhFg33f4haL5dbuiB5WoW79tQ,5JiaokGm1A7kyLq92YrQjp42Fr7Vqs52NBquCYiuU8DxKURkhfu,5KbQQbR83HFMPPaKCY4GPVBtNZZW4t6nNxtPEWkVPUHMWxpQLzS,5K7h5xxZNCfq6ujRmLWgCHHQKf4gAuKYAU8yDFRDwvkAN3scPki,5K5sRqqp3XebvjMmK1TYBFiSAd6XbwLeJa9L3CxWBMiWcSGCsDG,5J6sFQ2xv32UzS9dWJHZ8HHcjxcCYBiWR7mt3bhpvzdYj5xUjiJ,5KQDHX3bQHkhAeo9CW3KxJ1YiUfYPMVuEcsYeC7hgyyjFB5k8oz"


;(async ()=> {
    try {
        const signatureProvider = new JsSignatureProvider(PRIVATE_KEY_TEST.split(","));
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        // @ts-ignore
        const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

        // 获取区块链信息
        const { head_block_num, head_block_time } = await rpc.get_info();
     
        // 根据当前区块获取到时间戳和交易 id
        const { id, timestamp } = await rpc.get_block(head_block_num);
        console.debug("%s %d %s", timestamp, head_block_num, id, head_block_time);
        // const resp = await rpc.history_get_actions(BANKER, 1, 9);
        // console.log('=======================',resp.actions)
        // transfer(UE_TOKEN, UE_TOKEN, BANKER, '1.0000 UE', 'memo', PRIVATE_KEY_TEST.split(","))
        // .then(res => console.error(res))
        // .catch(err => console.error(err));

        getCurrencyBalance(UE_TOKEN, 'yujinsheng11', 'UE')
        .then(res => console.error(res))
        .catch(err => console.error(err));

    } catch (err) {
        throw err;
    }
    
})();

/**
 * 
 * @param { number } ms 
 */
async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
}


/**
 * 
 * @param { string } accountName 
 * @param { number } actionSeq 
 */
async function getTrxAction(accountName, actionSeq) {
    try {
        // @ts-ignore
        const rpc = new JsonRpc(END_POINT, { fetch });
        const resp = await rpc.history_get_actions(accountName, actionSeq, 50);
        // console.debug("resp: ", resp.actions);
        return resp.actions;
    } catch (err) {
        throw err;
    }
}

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
        //console.debug("resp: ", resp);
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
    "sleep"             : sleep,
    "getCurrencyBalance": getCurrencyBalance,
    "transfer"          : transfer,
    "UE_TOKEN"          : UE_TOKEN,
    "BANKER"            : BANKER,
    "UE_TOKEN_SYMBOL"   : UE_TOKEN_SYMBOL,
    "PRIVATE_KEY_TEST"  : PRIVATE_KEY_TEST
}