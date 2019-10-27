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
        map_time: {
            type: Sequelize.DATE,allowNull : false,defaultValue:Sequelize.NOW,comment: '建立映射的时间(世界标准时)',
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
        eth_txid:{
            type: Sequelize.TEXT,allowNull : false,comment: '充值/提现交易记录txid',
           // get(){return this.getDataValue('Txid')},set(valueToBeSet){this.setDataValue('Txid', valueToBeSet)},
        },
        from_eth_address:{
            type: Sequelize.TEXT,allowNull : false,comment: '代币输出地址',
          //  get(){return this.getDataValue('From_address')},set(valueToBeSet){this.setDataValue('From_address', valueToBeSet)},
        },
        to_eth_address:{
            type: Sequelize.TEXT,allowNull : false,comment: '代币输入地址',
            //get(){return this.getDataValue('pax_address')},set(valueToBeSet){this.setDataValue('pax_address', valueToBeSet)},
        },
        usdt_value:{
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: '本次操作的usdt金额',
          //  get(){return this.getDataValue('Pax_value')},set(valueToBeSet){this.setDataValue('Pax_value', valueToBeSet)},
        },
        ue_value:{
            type: Sequelize.DECIMAL(32,8).ZEROFILL,allowNull : false,comment: '本次操作的ue值',
           // get(){return this.getDataValue('Ue_value')},set(valueToBeSet){this.setDataValue('Ue_value', valueToBeSet)},
        },
        recharge_time:{
            type: Sequelize.DATE,allowNull : false,comment: '创建时间(世界标准时)',
           // get(){return this.getDataValue('recharge_time')},set(valueToBeSet){this.setDataValue('recharge_time', valueToBeSet)},
        },
        confirm_time:{
            type: Sequelize.DATE,allowNull : true,comment: '确认到帐时间(世界标准时)',
           // get(){return this.getDataValue('Confirm_time')},set(valueToBeSet){this.setDataValue('Confirm_time', valueToBeSet)},
        },
        exchange_time:{
            type: Sequelize.DATE,allowNull : true,defaultValue:Sequelize.NOW,comment: '兑换时间(世界标准时)',
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
            type: Sequelize.BIGINT(),allowNull : true,comment: 'Pog链上的兑换记录的高度',
           // get(){return this.getDataValue('pog_blockNumber')},set(valueToBeSet){this.setDataValue('pog_blockNumber', valueToBeSet)},
        },
        pog_account: {
            type: Sequelize.TEXT,allowNull : false,comment: 'POG的账号',
            //get(){return this.getDataValue('id')},set(valueToBeSet){this.setDataValue('Pog_Account', valueToBeSet)},
        },
        pog_txid:{
            type: Sequelize.TEXT,allowNull : true,comment: 'pog上的交易记录',
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