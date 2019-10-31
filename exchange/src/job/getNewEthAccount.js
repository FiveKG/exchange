//@ts-check
const {PROVIDER} = require("../common/constant/web3Config")
const Web3 = require('web3');
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'http://localhost:8545');
const logger = require("../common/logger").getLogger("getNewEthAccount.js")
const {sequelize} = require('../db')
const {generate_unique_key} = require("../common")
/**
 * 
 * @param {String} pog_account pog账号
 * @returns {Promise} PAX地址
 */
async function get_Eth_account(pog_account){
    try{
        let result = await sequelize.Eth_account.findOne({where:{pog_Account: pog_account}})

        if(result){
            //数据已存在
            return result.dataValues.eth_address
        }
        //未创建
        const address     = await web3.eth.personal.newAccount(generate_unique_key())
        const eth_key_pwd = generate_unique_key();
        const map_time    = new Date();
        

        result= await sequelize.Eth_account.create({
            id         : generate_unique_key(),
            pog_account: pog_account,
            eth_address: address,
            eth_key_pwd: eth_key_pwd,
            map_time   : map_time,
        })

        return result.dataValues.eth_address

    }catch(err){
        logger.error("get_Eth_account error,the error stock is %O",err)
    }

}

module.exports =get_Eth_account