//@ts-check
const {CONTRACT_ADDRESS,ACC0,ABI,PROVIDER} = require("../common/constant/web3Config")
const Web3 = require('web3');
const web3 = new Web3(process.env.PROVIDER||PROVIDER||'http://localhost:8545');
const get_balance = require("./getCurrencyBalance")
const logger = require("../common/logger").getLogger("getNewPaxAccount.js")
const {sequelize} = require('../db')
const {getCurrentDate,generate_unique_key} = require("../common")
const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)
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
        //const token_value   = await web3.eth.getBalance(address)
        const token_value = await contract.methods.balanceOf(address).call()
        const eth_key_pwd = generate_unique_key();
        const map_time    = getCurrentDate();
        let   ue_value    = await get_balance(pog_account);

        if(ue_value==false){
            //账号没UE币
            ue_value = 0;
        }else{
            ue_value =  ue_value.pop().replace(' UE','');
        }
        result= await sequelize.Eth_account.create({
            id         : generate_unique_key(),
            pog_account: pog_account,
            eth_address: address,
            token_value: token_value,
            eth_key_pwd: eth_key_pwd,
            map_time   : map_time,
            ue_value   : ue_value
        })
        return result.dataValues.eth_address

    }catch(err){
        logger.error("get PAX Account error,the error stock is %O",err)
    }

}

module.exports =get_Eth_account