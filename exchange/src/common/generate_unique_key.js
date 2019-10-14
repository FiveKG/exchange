// const uuidv4 = require("uuid/v4");
const shortid = require('shortid');

// /**
//  * 生成主键值
//  * @returns {String}
//  */
// function generate_primary_key(){    
//   return uuidv4();
// }

function generate_unique_key() {
  return shortid.generate()
}

module.exports = generate_unique_key;