//@ts-check
const log4js = require('log4js');

function getLogger(path){
    var option = {
        appenders: {
            out: { type: 'stdout' },
            everything: {
                type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log' ,
                encoding: 'utf-8',
                layout: {
                    type: "pattern",
                    // 配置模式
                    pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}'
                },
                // 日志文件按日期（天）切割
                pattern: "-yyyy-MM-dd",
                 // 回滚旧的日志文件时，保证以 .log 结尾 （只有在 alwaysIncludePattern 为 false 生效）
                keepFileExt: true,
                // 输出的日志文件名是都始终包含 pattern 日期结尾
                alwaysIncludePattern: true,
                }
          },
        categories: {
            default:{ appenders: [ 'out','everything'], level: 'warn' },
          }
        }
    
          //如果有设置 LOG_LEVEL 环境变量， 则使用环境变量里的值
      if (process.env.LOG_LEVEL) {
        option.categories.default.level = process.env.LOG_LEVEL;
      }
      else {
        //没有设置 ， 那么根据是否生产环境， 设置级别
        if (process.env.NODE_ENV === 'production') {

            option.categories.default.level = "warn";
        }
        else {
  
            option.categories.default.level = "debug";
        }
      }
      log4js.configure(option);
      return log4js.getLogger(path)
}

module.exports = { 
    "getLogger":getLogger
}


