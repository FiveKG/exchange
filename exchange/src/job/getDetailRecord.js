//@ts-check
const logger = require("../common/logger").getLogger('get_detail_record.js');
const {sequelize} = require('../db');

/**
 * 返回历史记录
 * @param {String} record_id 
 */
async function get_detail_record(record_id){
    try{
        const sql_result = await sequelize.Eth_charge.findOne({
            where:{id:record_id,is_exchanged:true},
            attributes:['exchange_time','to_eth_address','usdt_value','exchange_rate','service_charge','ue_value','pog_account'],
        })
        return sql_result.dataValues
    }catch(err){
        logger.error('this error from get_detail_record(),the error trace is %O',err)
        throw err
    }

}
module.exports = get_detail_record