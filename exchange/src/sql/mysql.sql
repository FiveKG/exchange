CREATE USER 'exchange_user'@'%' IDENTIFIED BY 'mysql_pass_2019';
CREATE DATABASE exchange DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
GRANT ALL ON exchange.* TO 'exchange_user'@'%';
alter user 'exchange_user'@'%' identified with mysql_native_password BY 'mysql_pass_2019';
flush privileges;
