// @ts-check
const pino = require("../logger").getLogger("get_field_value.js");
const parse = require("date-fns/parse");
const utility = require("utility");

/**
 * 获取默认值
 * @param {any} field_req_value  请求中获取到的值
 * @param {string} defined_type  定义的类型
 * @param {any} [specified_value] 在 api 的 field 里指定的默认值.
 */
function get_field_data(field_req_value, defined_type, specified_value) {
  if (field_req_value != null) {
    //客户端有提交值，那么直接返回这个值
    return convert_to_defined_type(field_req_value, defined_type);
  }
  else {
    //没有提交值， 看 service_define里 有没有  指定默认值，
    if (specified_value == undefined || specified_value == null) {
      //未指定， 则返回 null , 直接返回 null
      return null;
    }
    else {
      //有指定默认值， 则返回默认值。
      //默认值的特殊情况
      if (specified_value === "now" || specified_value === "now()") {
        return new Date();
      }
      //非特殊情况，返回指定的默认值
      return specified_value;
    }
  }
}

/**
* 把数据 转换成 类型指定的 类型
* 
* @param {object} origin_data 原始数据。字符串格式
* @param {string} defined_type 指定的类型.取值必须 在 api -> field 中  type 的值域里。
*/
function convert_to_defined_type(origin_data, defined_type) {
  if (origin_data == null)
    return null;

  var data;
  switch (defined_type.toLowerCase()) {
    case "string":
    case "text":
    case "ntext":
    case "char":
    case "nchar":
    case "varchar":
    case "nvarchar":
      //case "":
      data = get_str_value(origin_data);
      break;

    case "number":
    case "int":
    case "smallint":
    case "tinyint":
    case "short":
    case "long":
    case "float":
    case "double":
    case "decimal":
      //case "":
      data = get_number_value(origin_data);
      break;

    case "datetime":
    case "date":
      data = get_datetime_value(origin_data);
      break;

    case "boolean":
    case "bool":
    case "bit":
      data = get_boolean_value(origin_data);
      break;

    case "array":
    case "intarray":
    case "stringarray":
    case "objectarray":
      data = get_array_value(origin_data);
      break;

    case "object":
      data = get_object_value(origin_data);
      break;
  }
  if (data == null) {
    var err_str = `convert_to_defined_type时，不支持的类型:${defined_type}.将返回原始值:${origin_data}`
    var error = new Error(err_str);
    pino.error(error.message, error.stack);

    //throw error;
    return origin_data;
  }

  return data;
}

/**
* 
* @param {string} origin_string 
*/
function get_str_value(origin_string) {
  return origin_string || "";
}

/**
* 获取 数字值。注意， 转换成数字会溢出的情况下， 返回值会是字符串。
* @param {string|number} origin_number 原始的数字
* @returns {string|number} 
*/
function get_number_value(origin_number) {
  if (typeof origin_number === "string") {
    //@ts-ignore
    return utility.toSafenumber(origin_number);
  }
  else {
    return origin_number;
  }
}

/**
* 获取日期时间类型的值
* @param {Date|String} origin_date_time 
*/
function get_datetime_value(origin_date_time) {
  if (typeof origin_date_time === "string") {
     //@ts-ignore
    return parse(origin_date_time,'MM/dd/yyyy', new Date());
  }
  return origin_date_time;
}

/**
* 获取 boolean 类型的值
* @param {string|boolean} origin_bool 
*/
function get_boolean_value(origin_bool) {
  if (typeof origin_bool === "boolean") {
    return origin_bool;
  }
  return origin_bool == "true";
}

/**
* 
* @param {array|any} origin_array 
*/
function get_array_value(origin_array) {
  if (origin_array == null) {
    return [];
  }
  if (typeof origin_array === "string") {
    return JSON.parse(origin_array);
  }
  return origin_array;
}

function get_object_value(origin_object) {
  if (origin_object == null) {
    return {};
  }
  if (typeof origin_object === "string") {
    return JSON.parse(origin_object);
  }
  return origin_object;
}

module.exports = get_field_data;