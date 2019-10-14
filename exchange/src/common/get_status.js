//@ts-check
var logger = require("./logger.js");
var status_code_config = require("../../status_code.js");


/**
 * @description 状态 定义
 * @typedef {Object} Status
 * @property {number} code  状态的代码
 * @property {string}  desc  状态的描述
 * @property {any} data  状态的 数据
 */

/**
 * 获取某个状态配置. 
 * @param {string|number} [code_or_desc] 状态描述或者状态码. 不传递, 返回 { "code" : 1, "desc" : "成功" }
 * @param {object} [data] 要设置到 status 里data 字段上的值
 * @returns {Status}
 */
function get_status(code_or_desc, data) {
  if (!status_code_config) {
    var error = new Error(`system config don't exist status_config.`);
    logger.error(error.message, error.stack);
    throw error;
  }

  if (code_or_desc == null) {
    code_or_desc = "成功";
  }

  var status = null;
  if (typeof (code_or_desc) == "string") {
    status = status_code_config.find(t => { return t.desc == code_or_desc });
    if (!status) {
      var msg = `未找到 desc 为: [${code_or_desc}] 的 状态配置`;
      logger.info(msg)
      throw new Error(msg);
    }
  }
  else if (typeof (code_or_desc) == "number") {
    status = status_code_config.find(t => { return t.code == code_or_desc });
    if (!status) {
      var msg = `未找到 code 为: [ ${code_or_desc}] 的 状态配置`;
      logger.info(msg)
      throw new Error(msg);
    }
  }

  status = JSON.parse(JSON.stringify(status));  //简单粗暴的 深拷贝
  if (data != undefined) {
    status["data"] = data;
  }
  return status;
}

module.exports = get_status;