// @ts-check

// 游戏状态
const GAME_STATE = {
    "INIT": 0,
    "START": 1,
    "REWARDING": 2,
    "AWARDED": 3
};

// 开奖号码的位数
const OPEN_CODE_COUNT = 2;

/**
 * @type { Constant }
 */
const CONSTANT = {
    "GAME_STATE": GAME_STATE,
    "OPEN_CODE_COUNT": OPEN_CODE_COUNT,
}

module.exports = CONSTANT

/**
 * @description 
 * @typedef { Object } Constant
 * @property {{ "INIT": number, "START": number, "REWARDING": number, "AWARDED": number }} GAME_STATE 游戏状态
 * @property { number } OPEN_CODE_COUNT 开奖号码的位数
 */