const pino = require("../logger").getLogger('check_type.js');
const isValid = require("date-fns/isValid");

const numberTypeCache = {
  "number": 1,
  "float": 1,
  "long": 1,
  "int": 1,
  "decimal": 1,
  "double": 1,
  "smallint": 1,
  "tinyint": 1,
  "byte": 1
};
const stringTypeCache = {
  "string": 1,
  "char": 1,
  "nvarchar": 1,
  "varchar": 1,
  "text": 1
};
const arrayTypeCache = {
  "array": 1,
  "objectarray": 1,
  "numberarray": 1,
  "stringarray": 1
};

/**
 * 检查请求数据的类型是否符合接口定义的要求
 * @param {String} require_type 接口要求的类型
 * @param {Any} request_value 请求数据的值
 */
function check_type(require_type, request_value) {
  require_type = require_type.toLowerCase();

  //todo:  特殊类型,指的是非js的基础类型 ，一般是系统定义的枚举类型。  例如： account_state 。 约定必须包含 _
  if (require_type.indexOf("_") > -1) {
    //特殊类型，检查值是否是数字
    //todo: 读取  系统配置 sysEnumConfig里对应的配置，查找是否匹配。 暂不检查
    return !isNaN(request_value);
  }

  if (numberTypeCache[require_type]) {
    //service_define 中的类型是 数字 类型 eg: number ， int ,tinyint ,float  等等
    //定义中要求 的是数字类型，那么检查 request_value 是否是 数字
    return !isNaN(request_value);
  }
  else if (stringTypeCache[require_type]) {
    //service_define 中的类型是 字符串 类型 eg: char , string ,text 等等
    //字符串类型，检查是否是字符串
    return (typeof (request_value) == "string" || typeof (request_value) == "object");
  } else if (require_type == "bool" || require_type == "bit" || require_type == "boolean") {
    //service_define 中的类型是 布尔类型
    if (typeof (request_value) == "string") {
      //如果参数值的类型，是字符串， 检查参数值是否是 "true" 或 "false"
      return (request_value.toLowerCase() == "true" || request_value.toLowerCase() == "false")
    } else if (typeof (request_value) == "boolean") {
      //如果参数值的类型，是 boolean ， 那么检查参数值 是否 == true 或 false
      return true;
      //return (typeof ( request_value == true || request_value == false ));
    } else {
      //service_define 中的类型是 布尔类型， 但提交的参数值既不是字符串的 true 或 false ，
      //也不是 true 或 false
      //此时， 抛出参数类型不匹配。
      return false;
    }
  } else if (require_type == "datetime" || require_type == "date") {
    return isValid(new Date(request_value));
  } else if (require_type == "object") {
    return typeof (request_value) == "object";
  } else if (arrayTypeCache[require_type]) {
    return Array.isArray(request_value);
  }

  // log("error", "数据类型验证", "未知的数据类型。无法验证", meta);
  pino.warn(`type: ${require_type} is not support.`);
  return false;
}

module.exports = check_type;