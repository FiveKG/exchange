
#!/bin/bash
#Description: run EXCHANGE service
unset EOS_END_POINT 
unset EXCHANGE_SERVER_HOST
unset EXCHANGE_SERVER_PORT

unset EXCHANGE_DB_HOST
unset EXCHANGE_DB_PORT
unset EXCHANGE_DB_NAME
unset EXCHANGE_DB_USER
unset EXCHANGE_DB_PASS

unset EXCHANGE_RABBIT_HOST
unset EXCHANGE_RABBIT_PORT
unset EXCHANGE_RABBIT_USER
unset EXCHANGE_RABBIT_PASS

unset EXCHANGE_REDIS_HOST
unset EXCHANGE_REDIS_PORT
unset EXCHANGE_REDIS_PASS

unset ETH_PROVIDER
unset NODE_ENV

export EOS_END_POINT=http://node3.poggy.one:8888

export EXCHANGE_SERVER_HOST=0.0.0.0
export EXCHANGE_SERVER_PORT=7758
export NODE_ENV=debug

export EXCHANGE_DB_HOST=127.0.0.1
export EXCHANGE_DB_PORT=3306
export EXCHANGE_DB_NAME=exchange
export EXCHANGE_DB_USER=exchange_user
export EXCHANGE_DB_PASS=mysql_pass_2019

export EXCHANGE_REDIS_HOST=127.0.0.1
export EXCHANGE_REDIS_PORT=6379
export EXCHANGE_REDIS_PASS=redis_pass_2019

export EXCHANGE_RABBIT_HOST=127.0.0.1
export EXCHANGE_RABBIT_PORT=5672
export EXCHANGE_RABBIT_USER=mq_user
export EXCHANGE_RABBIT_PASS=pass_2019

export ETH_PROVIDER=http://ethapi.GPSTOKEN.IO:8545

cat > ./config.js <<EOF
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
EOF

ex=$(which pm2)
if [ ! -e $ex ];
then
    npm i -g pm2
fi

pm2 start pm2.json