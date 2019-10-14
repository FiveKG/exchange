// @ts-check
const pino = require("../logger").getLogger('get_data');

/**
 * @typedef {Object} Data
 * @property {Object} require_data 接口定义中要求的数据
 * @property {Object} request_data 请求对象中的请求参数或请求体的数据
 * @property {Object} request_headers 请求对象中的请求头数据
 */

/**
 * 获取请求数据和接口定义数据
 * @param {Object} req 请求对象
 * @param {Object} service_define 服务定义
 * @returns {Data}
 */
function get_data(req, service_define) {
  if (!req) {
    var error = new Error("req_data must not null.");
    pino.error(error.message, error.stack);
    throw error;
  }

  const req_url = req.path.toLowerCase();
  const api_info = service_define.apis.find((api) => { return api.url === req_url; });
  if (api_info === undefined) {
    var error = new Error(`current request url : ${req_url} is not exist in api. pls check.`);
    pino.error(error.message, error.stack);
    throw error;
  }

  const req_method = req.method.toLowerCase();
  const api_method = api_info.type.toLowerCase();
  if (req_method !== api_method) {
    var error = new Error(`current request method : ${req_method} is not same as api method: ${api_method}. pls check.`);
    pino.error(error.message, error.stack);
    throw error;
  }

  let request_data = null;
  if (req_method === "get") {
    request_data = req.query;
  } else if (req_method === "post") {
    request_data = req.body;
  } else {
    var error = new Error(`current system is not support this request method: ${req_method}. pls check.`);
    pino.error(error.message, error.stack);
    throw error;
  }

  const require_data = api_info.req;
  const request_headers = req.headers;

  return {
    require_data,
    request_data,
    request_headers
  };
}

module.exports = get_data;