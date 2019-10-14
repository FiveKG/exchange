//@ts-check
const shortid = require('shortid');
/**
 * 
 * @param {*} sequelize 
 * @param {*} Sequelize 
 */
function createTable(sequelize,Sequelize){
    const Eth_account = sequelize.define('Eth_account', {
        // 属性
        id :{
            type: Sequelize.STRING,defaultValue:shortid.generate(),primaryKey: true,comment: 'Eth_account_id',
            //get(){return this.getDataValue('id')}
        },
        pog_account: {
          type: Sequelize.TEXT,allowNull : false,comment: '一个小写的POG的账号',
          //get(){return this.getDataValue('id')},set(valueToBeSet){this.setDataValue('Pog_Account', valueToBeSet)},
        },
        eth_address: {
          type: Sequelize.TEXT,allowNull : false,comment: '以太坊地址',
          //get(){return this.getDataValue('PAX_Address')},set(valueToBeSet){this.setDataValue('PAX_Address', valueToBeSet)},
        },
        token_value: {
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: '本ETH地址上的代币余额',
           // get(){return this.getDataValue('Pax_value')},set(valueToBeSet){this.setDataValue('Pax_value', valueToBeSet)},
        },
        ue_value: {
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: 'Ue的余额',
           // get(){return this.getDataValue('Ue_value')},set(valueToBeSet){this.setDataValue('Ue_value', valueToBeSet)},
        },
        map_time: {
            type: Sequelize.DATE,allowNull : false,defaultValue:Sequelize.NOW,comment: '建立映射的时间',
           // get(){return this.getDataValue('Map_time')},set(valueToBeSet){this.setDataValue('Map_time', valueToBeSet)},
        },
        eth_key_pwd: {
            type: Sequelize.TEXT,allowNull : false,comment: '解锁eth账号的密码',
            //get(){return this.getDataValue('pax_key_pwd')},set(valueToBeSet){this.setDataValue('pax_key_pwd', valueToBeSet)},
        }
      }, {
        timestamps: false,
        comment :"pax账号表",
        freezeTableName: true,
      }
    
      );
    
    const Eth_charge = sequelize.define('Eth_charge',{
        id :{
            type: Sequelize.STRING,defaultValue:shortid.generate(),primaryKey: true,comment: 'Eth_charge_id',
            //get(){return this.getDataValue('id')}
        },
        txid:{
            type: Sequelize.TEXT,allowNull : false,comment: '充值交易记录txid',
           // get(){return this.getDataValue('Txid')},set(valueToBeSet){this.setDataValue('Txid', valueToBeSet)},
        },
        from_address:{
            type: Sequelize.TEXT,allowNull : false,comment: '以太坊地址,充值进入的源地址',
          //  get(){return this.getDataValue('From_address')},set(valueToBeSet){this.setDataValue('From_address', valueToBeSet)},
        },
        to_address:{
            type: Sequelize.TEXT,allowNull : false,comment: '本次充值目的地址',
            //get(){return this.getDataValue('pax_address')},set(valueToBeSet){this.setDataValue('pax_address', valueToBeSet)},
        },
        token_value:{
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: '本次充值token金额',
          //  get(){return this.getDataValue('Pax_value')},set(valueToBeSet){this.setDataValue('Pax_value', valueToBeSet)},
        },
        ue_value:{
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: '兑换的ue值',
           // get(){return this.getDataValue('Ue_value')},set(valueToBeSet){this.setDataValue('Ue_value', valueToBeSet)},
        },
        recharge_time:{
            type: Sequelize.DATE,allowNull : false,comment: '创建时间',
           // get(){return this.getDataValue('recharge_time')},set(valueToBeSet){this.setDataValue('recharge_time', valueToBeSet)},
        },
        confirm_time:{
            type: Sequelize.DATE,allowNull : false,comment: '确认到帐时间',
           // get(){return this.getDataValue('Confirm_time')},set(valueToBeSet){this.setDataValue('Confirm_time', valueToBeSet)},
        },
        exchange_time:{
            type: Sequelize.TEXT,allowNull : false,defaultValue:Sequelize.NOW,comment: '兑换时间',
           // get(){return this.getDataValue('exchange_time')},set(valueToBeSet){this.setDataValue('exchange_time', valueToBeSet)},
        },
        is_exchanged:{
            type: Sequelize.BOOLEAN,allowNull : false,comment: '是否兑换执行过',
           // get(){return this.getDataValue('Is_exchanged')},set(valueToBeSet){this.setDataValue('Is_exchanged', valueToBeSet)},
        },
        eth_blockNumber:{
            type: Sequelize.BIGINT(),allowNull : false,comment: '转账记录的以太坊高度',
           // get(){return this.getDataValue('eth_blockNumber')},set(valueToBeSet){this.setDataValue('eth_blockNumber', valueToBeSet)},
        },
        pog_blockNumber:{
            type: Sequelize.BIGINT(),allowNull : false,comment: 'Pog链上的兑换记录的高度',
           // get(){return this.getDataValue('pog_blockNumber')},set(valueToBeSet){this.setDataValue('pog_blockNumber', valueToBeSet)},
        },
        pog_txtid:{
            type: Sequelize.TEXT,allowNull : false,comment: 'pog上的交易记录',
            //get(){return this.getDataValue('pog_txtid')},set(valueToBeSet){this.setDataValue('pog_txtid', valueToBeSet)},
        },
        log_info:{
            type: Sequelize.TEXT,allowNull : true,comment: '本兑换的执行记录备注',
           // get(){return this.getDataValue('Log_info')},set(valueToBeSet){this.setDataValue('Log_info', valueToBeSet)},
        },
    },{
        timestamps: false,//取消默认时间戳
        comment :'USDT转账记录',
        freezeTableName: true,//禁止修改表名. 默认情况下

      })

    return  {'Eth_account':Eth_account,'Eth_charge':Eth_charge}
}
module.exports = createTable;