// @ts-check
/**
* 获取日期时间类型的值
* @param {Date|String} origin_date_time 
*/
const parse = require("date-fns/parse");
function get_datetime_value(origin_date_time) {
    if (typeof origin_date_time === "string") {
        //@ts-ignore
        return parse(origin_date_time,'MM/dd/yyyy', new Date());
      
    }
    return origin_date_time;
  }
  
  console.log(get_datetime_value('02/11/2014'));