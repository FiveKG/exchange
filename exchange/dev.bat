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

unset PROVIDER
unset NODE_ENV

set EOS_END_POINT = http://172.19.2.125:8888
set TBG_SERVER = http://192.168.1.141:9527/
set EXCHANGE_SERVER_HOST=0.0.0.0
set EXCHANGE_SERVER_PORT=7758
set NODE_ENV = debug

set EXCHANGE_DB_HOST = 192.168.92.128
set EXCHANGE_DB_PORT = 3306
set EXCHANGE_DB_NAME = exchange
set EXCHANGE_DB_USER = exchange_user
set EXCHANGE_DB_PASS = mysql_pass_2019

set EXCHANGE_REDIS_HOST = 192.168.92.128
set EXCHANGE_REDIS_PORT = 7758
set EXCHANGE_REDIS_PASS = redis_pass_2019

set EXCHANGE_RABBIT_HOST = 192.168.92.128
set EXCHANGE_RABBIT_PORT = 5672
set EXCHANGE_RABBIT_USER = mq_user
set EXCHANGE_RABBIT_PASS = pass_2019

set PROVIDER = http://localhost:8545
node exchange.js
