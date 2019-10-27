// @ts-check


// EOS token 合约账户
//最低转账金额
const BASE_AMOUNT = '100';

const EOS_TOKEN = "eosio.token";
const EOS_TOKEN_SYMBOL = "EOS"
// UE token 合约账户
const UE_TOKEN = "uetokencoin";
const UE_TOKEN_SYMBOL = "UE"
// TBG token 测试账户
const TBG_TOKEN = "tbgjoin"

// TBG token 测试账户
const TBG_TOKEN2 = 'tbgtokencoin'


// // // 节点信息
const END_POINT = process.env.EOS_END_POINT || "http://45.251.109.187:8888";

// // 私钥
// const PRIVATE_KEY_TEST = "5J6sFQ2xv32UzS9dWJHZ8HHcjxcCYBiWR7mt3bhpvzdYj5xUjiJ,5KQDHX3bQHkhAeo9CW3KxJ1YiUfYPMVuEcsYeC7hgyyjFB5k8oz"
const JWT_SECRET = "Cpj9cTX8aZEIIThCyT1jWG4D4xqGNGH9caZAG5SQ";

// 私钥
const PRIVATE_KEY_TEST = "5J2GxxF4xCfAZjP9R26jwnVY8rp8FYqXRE1fJPq5KDMSxa5NRuW,5K3LFVo36rAYBuAGC1UQmrZtrtvLkuWVYQ6TyhzwBgB2DpHo4zB,5K56kFugCU8UwbREvaZ8DTnH45q1LCMCQwp6xRHTGmxZVpUxBtt,5Kd5ExHx2AZwcnfFsQwNuiMvbeZvk1WGBD1iyc4FjwT5WBmDEF6,5JrN9PmaBTuDuoDBhYPwVsBmjTwtdpeGg4LN1sTCzv8igZgtxrx,5JZH8pBYdr3yfZnDhPtZzu9437tRoUJVCny8DvtCx1kbBh6KqyW,5JSZgw2fuoeXLXzwoQyBJ3L9vwH7AoQxjwBQRar4G2jqXnfrSXW,5KSzppBW7LcwVQ4hA1AQP4vZYWq1uEv4EQnZ5yz1eu41eLgrLK2,5JRiAXpyd5TW5REvLYd35FkrJSMjFfiUtrwrCNpChHFMVNnRDwB,5JAW6eWS4ADjwCr76xCvmPefknzhFg33f4haL5dbuiB5WoW79tQ,5JiaokGm1A7kyLq92YrQjp42Fr7Vqs52NBquCYiuU8DxKURkhfu,5KbQQbR83HFMPPaKCY4GPVBtNZZW4t6nNxtPEWkVPUHMWxpQLzS,5K7h5xxZNCfq6ujRmLWgCHHQKf4gAuKYAU8yDFRDwvkAN3scPki,5K5sRqqp3XebvjMmK1TYBFiSAd6XbwLeJa9L3CxWBMiWcSGCsDG,5KNoQXeFJp47dbtyifcCjJuhXjYmNvWPVcWYsHJJWZ8h7zAd78h,5KQairxa939NMKHfuyQWw9tSaiSk4B787HEPvTvd1BzReANJECo,5KSzppBW7LcwVQ4hA1AQP4vZYWq1uEv4EQnZ5yz1eu41eLgrLK2,5JRiAXpyd5TW5REvLYd35FkrJSMjFfiUtrwrCNpChHFMVNnRDwB,5JAW6eWS4ADjwCr76xCvmPefknzhFg33f4haL5dbuiB5WoW79tQ,5JiaokGm1A7kyLq92YrQjp42Fr7Vqs52NBquCYiuU8DxKURkhfu,5KbQQbR83HFMPPaKCY4GPVBtNZZW4t6nNxtPEWkVPUHMWxpQLzS,5K7h5xxZNCfq6ujRmLWgCHHQKf4gAuKYAU8yDFRDwvkAN3scPki,5K5sRqqp3XebvjMmK1TYBFiSAd6XbwLeJa9L3CxWBMiWcSGCsDG,5J6sFQ2xv32UzS9dWJHZ8HHcjxcCYBiWR7mt3bhpvzdYj5xUjiJ,5KQDHX3bQHkhAeo9CW3KxJ1YiUfYPMVuEcsYeC7hgyyjFB5k8oz"

/**
 * @type { Constant }
 */
const CONSTANT = {
    "BASE_AMOUNT"     : BASE_AMOUNT,
    "EOS_TOKEN"       : EOS_TOKEN,
    "UE_TOKEN"        : UE_TOKEN,
    "TBG_TOKEN"       : TBG_TOKEN,
    "TBG_TOKEN2"      : TBG_TOKEN2,
    "END_POINT"       : END_POINT,
    "PRIVATE_KEY_TEST": PRIVATE_KEY_TEST,
    "EOS_TOKEN_SYMBOL": EOS_TOKEN_SYMBOL,
    "UE_TOKEN_SYMBOL" : UE_TOKEN_SYMBOL,
    "JWT_SECRET"      : JWT_SECRET
}

module.exports = CONSTANT

/**
 * @description 
 * @typedef { Object } Constant
 * @property { String } BASE_AMOUNT 对峙转账金额
 * @property { String } EOS_TOKEN EOS 代币合约帐号 eosio.token
 * @property { String } UE_TOKEN UE 代币合约帐号
 * @property { String } TBG_TOKEN 测试帐号1
 * @property { String } TBG_TOKEN2 测试帐号2
 * @property { String } END_POINT scatter 节点
 * @property { String } PRIVATE_KEY_TEST 私钥
 * @property { String } EOS_TOKEN_SYMBOL EOS 代币符号
 * @property { String } UE_TOKEN_SYMBOL UE 代币符号
 * @property { String } JWT_SECRET  token
 */