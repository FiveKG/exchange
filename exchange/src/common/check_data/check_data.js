// @ts-check
const pino = require("../logger").getLogger('check_data.js');
const check_type = require("./check_type");
const get_field_value = require("./get_field_value");
const get_status = require("../get_status");

/**
 * @typedef {Object} Data
 * @property {Object} require_data 接口定义中要求的数据
 * @property {Object} request_data 请求对象中的请求参数或请求体的数据
 * @property {Object} request_headers 请求对象中的请求头数据
 */

/**
 * 检查数据
 * @param {Data} data 需要检查的数据
 * @returns {Object}
 */
function check_data({ require_data, request_data, request_headers }) {
  // 保存不存在的参数和不匹配的参数
  const not_exist_params = [];
  const not_match_params = [];
  // 保存当前接口的请求参数对象
  let data = {};

  for (let field_name in require_data) {
    const require_field_define = require_data[field_name];
    const require_field_define_type = require_field_define.type;
    let request_field_value = request_data[field_name];

    if (require_field_define.from && require_field_define.from === "header") {
      request_field_value = request_headers[field_name];
    }

    // 如果 is_require = true , 检查是否提交参数
    if (require_field_define.is_require) {
      if (request_field_value === undefined || request_field_value === null) {
        pino.error(`param: [${field_name}] must given.`);
        not_exist_params.push(field_name);
      }
    }

    // 如果有提交参数, 检查参数类型是否匹配
    if (request_field_value !== undefined && request_field_value !== null) {
      const passed = check_type(require_field_define_type, request_field_value);
      if (!passed) {
        pino.error(`param: [${field_name}] type does not match the required type of define.`);
        not_match_params.push(field_name);
      }
      
      data[field_name] = get_field_value(request_field_value, require_field_define_type, require_field_define.default);
    }
    
    // 如果参数为空, 但有默认值, 使用默认值
    if ((request_field_value === undefined || request_field_value === null) && require_field_define.default !== undefined) {
      data[field_name] = get_field_value(request_field_value, require_field_define_type, require_field_define.default);
    }
  }

  if (not_exist_params.length > 0 || not_match_params.length > 0) {
    var error_status = get_status(2000);
    error_status.desc += not_exist_params.length === 0 ? "" : `, The required parameters are not passed as follows: ${not_exist_params.join(" , ")}`;
    error_status.desc += not_match_params.length === 0 ? "" : `, The types of the following parameters do not match: ${not_match_params.join(" , ")}`;
    
    throw error_status;
  }

  return data;
}

module.exports = check_data;