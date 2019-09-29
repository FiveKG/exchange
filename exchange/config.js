module.exports = {
    "db" : {
        "host"    : "192.168.92.128",   //我的虚拟机
        "database": "hash_dice",
        "user"    : "hash_dice_user",
        "password": "pass_2019",
        "port"    : 5432,
    },
    "redis": {
        "host" : "192.168.1.115",
        "port" : 6379,
        "auth" : "redis_pass_2018"
    },
    "rabbitmq": {
        "host": "192.168.1.115",//内网测试服务器
        "port": 5672,
        "user": "mq_user",
        "pwd" : "pass_2018"
    } 
}