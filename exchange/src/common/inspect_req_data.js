// @ts-check
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { get_data, check_data } = require("./check_data");
const server_define_location = path.join(__dirname, "../../service_define.json");
assert(fs.existsSync(server_define_location), `file [${server_define_location}] is not exists.`);

const server_define_info = require(server_define_location);
// console.log(server_define_info);
/**
 * 检查请求对象中的数据
 * @param {Object} req 请求对象
 * @returns {Object}
 */
function inspect_req_data(req) {
  let service_define = server_define_info || {};
  const data = get_data(req, service_define);
  const req_data = check_data(data);
  return req_data;
}

module.exports = inspect_req_data;