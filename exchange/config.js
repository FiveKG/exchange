module.exports = {
    "db" : {
        "host"    : "127.0.0.1",  
        "database": "exchange",
        "user"    : "hash_dice_user",
        "password": "mysql_pass_2019",
        "port"    : 3306,
    },
    "redis": {
        "host" : "127.0.0.1",
        "port" : 6379,
        "auth" : "redis_pass_2019"
    },
    "rabbitmq": {
        "host": "127.0.0.1",
        "port": 5672,
        "user": "mq_user",
        "pwd" : "pass_2019"
    } 
}
