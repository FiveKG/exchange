//@ts-check
const logger = require("../common/logger").getLogger('getEOSTrxAction.js');
const {sequelize} = require('../db');

/**
 * 返回历史记录
 * @param {String} account_name 
 */
async function get_history(account_name){
    try{
        const sql_result = await sequelize.Eth_charge.findAll({
            where:{pog_account:account_name,is_exchanged:true},
            attributes:["ue_value",'exchange_time','log_info','id'],
            order: [['exchange_time', 'DESC']]
        })
        //@ts-ignore
        const history_array = sql_result.map(element=>{
            return element.dataValues
        })
        return history_array
    }catch(err){
        logger.error('this error from get_history(),the error trace is %O',err)
        throw err
    }

}

module.exports = get_history