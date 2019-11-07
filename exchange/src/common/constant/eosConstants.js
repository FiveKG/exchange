// @ts-check


// EOS token 合约账户

// // UE token 合约账户
const UE_CONTRACT = "ue.token";
const UE_TOKEN_SYMBOL = "UE"
// TBG token 测试账户,钱都在这
//const UE_TOKEN = "uecirculate";
const UE_TOKEN = "uecirculate";
//打钱钱包
const UE_TOKEN2 = "uehcirculate";
// TBG token 测试账户钱多一点
const TBG_TOKEN2 = '11g22p33s'
//测试出款



// // // 节点信息
// const END_POINT = process.env.EOS_END_POINT || "http://node3.poggy.one:8888";

//测试节点
 const END_POINT = process.env.EOS_END_POINT || "http://testnode.poggy.one:8888";
// // 私钥
// const PRIVATE_KEY_TEST = "5J6sFQ2xv32UzS9dWJHZ8HHcjxcCYBiWR7mt3bhpvzdYj5xUjiJ,5KQDHX3bQHkhAeo9CW3KxJ1YiUfYPMVuEcsYeC7hgyyjFB5k8oz"
const JWT_SECRET = "Cpj9cTX8aZEIIThCyT1jWG4D4xqGNGH9caZAG5SQ";

// 私钥
const PRIVATE_KEY_TEST = "5KSojdUwrwA1dMBmyhEKXaocjyfdXxmFqUtDT468rmQb6QvgwAd,5JQv2XMnqW8YUV9x8rY4iZK9R6QRFXAKggas5t3mPBnJCeGQHSg,5KhXUGFy5nyqmfU89u328kG8Ya6HaznU4at5a57aFxPbXRNxYXD"


/**
 * @type { Constant }
 */
const CONSTANT = {
    "UE_CONTRACT"     : UE_CONTRACT,
    "UE_TOKEN"        : UE_TOKEN,
    "UE_TOKEN2"       : UE_TOKEN2,
    "TBG_TOKEN2"      : TBG_TOKEN2,
    "END_POINT"       : END_POINT,
    "PRIVATE_KEY_TEST": PRIVATE_KEY_TEST,
    "UE_TOKEN_SYMBOL" : UE_TOKEN_SYMBOL,
    "JWT_SECRET"      : JWT_SECRET
}

module.exports = CONSTANT

/**
 * @description 
 * @typedef { Object } Constant
 * @property { String } UE_CONTRACT UE 代币合约帐号
 * @property { String } UE_TOKEN 最有钱
 * @property { String } UE_TOKEN2 第二有钱
 * @property { String } TBG_TOKEN2 测试帐号2
 * @property { String } END_POINT scatter 节点
 * @property { String } PRIVATE_KEY_TEST 私钥
 * @property { String } UE_TOKEN_SYMBOL UE 代币符号
 * @property { String } JWT_SECRET  token
 */