// @ts-check


/**
 * 提交基础
 */
const BASE_CASH = '10';
/**
 * 兑换比例
 */
const USDT2UE_RATE = "1";
const UE2USDT_RATE = "1";

/**
 * 提现时热账号的金额不得低于MINIUSDT 
 */
const MINIUSDT  = '100000'
/**
 * 热账号的最大限定值和最小值
 */
const HOT_ADDRESS_MAX = "100000000001000";
const HOT_ADDRESS_MIN = "5000000000";

/**
 * 手续费
 */
const USDT2UE_TAX = "0 USDT";
const UE2USDT_TAX = "5 USDT";

/**
 * 转账到期时间,小时
 */
const EXPIRATION_HOUR =24;

/**
 * TBG发币规划
 * @type { Constant }
 */
const CONSTANT = {
    "USDT2UE_RATE"   : USDT2UE_RATE,
    "UE2USDT_RATE"   : UE2USDT_RATE,
    "HOT_ADDRESS_MAX": HOT_ADDRESS_MAX,
    "HOT_ADDRESS_MIN": HOT_ADDRESS_MIN,
    "USDT2UE_TAX"    : USDT2UE_TAX,
    "UE2USDT_TAX"    : UE2USDT_TAX,
    "EXPIRATION_HOUR": EXPIRATION_HOUR,
    "BASE_CASH"      : BASE_CASH,
    "MINIUSDT"       : MINIUSDT
}

module.exports = CONSTANT

/**
 * @description 常量
 * @typedef { Object } Constant
 * @property { String } USDT2UE_RATE
 * @property { String } UE2USDT_RATE
 * @property { String } HOT_ADDRESS_MAX
 * @property { String } HOT_ADDRESS_MIN
 * @property { String } MINIUSDT
 * @property { String } USDT2UE_TAX
 * @property { String } UE2USDT_TAX
 * @property { Number } EXPIRATION_HOUR
 * @property { String } BASE_CASH
*/