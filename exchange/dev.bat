#!/bin/bash
#Description: run HASH_DICE service
unset EXCHANGE_SERVER_HOST
unset EXCHANGE_SERVER_PORT
unset NODE_ENV

set TBG_SERVER=http://192.168.1.141:9527/
set EXCHANGE_SERVER_HOST=0.0.0.0
set EXCHANGE_SERVER_PORT=7758
set NODE_ENV = debug
node exchange.js
