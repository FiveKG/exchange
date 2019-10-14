// @ts-check

/***
 * 1. 0.8% 拨入TBG钱包；
 /**
  * TBG钱包再分配
 * 1. 0.1% 拨入TBG股东分红池;
 * 2. 0.1% 拨入TBG三倍保障池;
 * 3. 0.3% TBG推荐佣金;
 * 4. 0.3% TSH投资股东收益;
  */
const BASE_RATE = 100;



// 0.8% TGG钱包
const ALLOC_TO_TBG =0.8;



/**
 * TBG发币规划
 * @type { Constant }
 */
const CONSTANT = {
    "BASE_RATE": BASE_RATE,
    "ALLOC_TO_TBG": ALLOC_TO_TBG
}

module.exports = CONSTANT

/**
 * @description 常量
 * @typedef { Object } Constant
 * @property { number } BASE_RATE 
 * @property { number } ALLOC_TO_TBG 0.8% TSH投资股东收益
 */
