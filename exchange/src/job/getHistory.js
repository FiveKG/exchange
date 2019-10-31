//@ts-check
const logger = require("../common/logger").getLogger('getEOSTrxAction.js');
const {sequelize} = require('../db');

/**
 * 返回历史记录
 * @param {String} pog_account 
 */
async function get_history(pog_account){
    try{
        const sql_result = await sequelize.Eth_charge.findAll({
            where:{pog_account:pog_account,is_exchanged:true},
            attributes:["ue_value",'exchange_time','log_info','id','eth_txid'],
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