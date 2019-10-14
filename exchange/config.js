module.exports = {
    "db" : {
        "host"    : "192.168.92.128",   //我的虚拟机
        "database": "exchange",
        "user"    : "exchange_user",
        "password": "mysql_pass_2019",
        "port"    : 3306,
    },
    "redis": {
        "host" : "192.168.92.128",
        "port" : 7758,
        "auth" : "redis_pass_2019"
    },
    "rabbitmq": {
        "host": "192.168.92.128",
        "port": 5672,
        "user": "mq_user",
        "pwd" : "pass_2018"
    } 
}