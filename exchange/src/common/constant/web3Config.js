//@ts-check
//服务提供器
const PROVIDER = process.env.ETH_PROVIDER||'http://localhost:8545'

 

//Exchange合约地址
const CONTRACT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";//"0x36CB591c2c6446Ae74f55457061B3a85B698dC16";
//发币账号
const USDT_COIN = "0x2a6f0e7ce6cb445cb8d1928274792dab9f28107c";
//热钱包
const HOT_ADDRESS = "0xDcCE5Fec3890be188Fca7427794E8b1B62ba5576";//"0xd73b2c72435276c98a1266db457fbcd0c2d2bf28";
//冷钱包1
const COLD_ADDRESS1 = "0xd1a1c25c5Fc7f7C2f1DE0DAA5DCc8A7269A8D40D";//"0xbb123b7f59c2f85049be43bc612c92a04558f125";
//冷钱包2
const COLD_ADDRESS2 = "0xe508062993724b18604905ddE63949D36Ec7662d";//"0x9e95a55be4b200775623c70af63061fc05869495";
//冷钱包3
const COLD_ADDRESS3 = "0xe61C73D4AeDC080766222b761894B3209EA95449";//"0x2c6f76a4bb4ed82155e754355b832655190732d9";
//冷钱包4
const COLD_ADDRESS4 = "0x79278f06dB692dfcE39cd8225bb79910d5B790fF";//"0x239a4d35728ddff5f9d2f6cba55caca743650313";
//冷钱包5
const COLD_ADDRESS5 = "0xB472c2788Acd9f50f5547564a641Ce3179f59beb";//"0x33f9fb77222ccaaa45f76cb680b99c371014e72e";
//钱包集合
const ADDRESSES = [HOT_ADDRESS,COLD_ADDRESS1,COLD_ADDRESS2,COLD_ADDRESS3,COLD_ADDRESS4,COLD_ADDRESS5]


//合约abi，压缩地址：https://www.sojson.com/yasuo.html
const ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isFunding","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newContractAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenExchangeRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenMigrated","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"currentSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ethFundDeposit","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"fundingStartBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fundingStopBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_ethFundDeposit","type":"address"},{"name":"_currentSupply","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"AllocateToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"IssueToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_value","type":"uint256"}],"name":"IncreaseSupply","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_value","type":"uint256"}],"name":"DecreaseSupply","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Migrate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"constant":false,"inputs":[{"name":"_tokenExchangeRate","type":"uint256"}],"name":"setTokenExchangeRate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"increaseSupply","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"decreaseSupply","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_fundingStartBlock","type":"uint256"},{"name":"_fundingStopBlock","type":"uint256"}],"name":"startFunding","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"stopFunding","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newContractAddr","type":"address"}],"name":"setMigrateContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newFundDeposit","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"migrate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"transferETH","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_addr","type":"address"},{"name":"_eth","type":"uint256"}],"name":"allocateToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]


/**
 * @type { Web3 }
 */
const WEB3 = {
    'PROVIDER'        : PROVIDER,
    'CONTRACT_ADDRESS': CONTRACT_ADDRESS,
    "USDT_COIN"       : USDT_COIN,
    'HOT_ADDRESS'     : HOT_ADDRESS,
    'COLD_ADDRESS1'   : COLD_ADDRESS1,
    'COLD_ADDRESS2'   : COLD_ADDRESS2,
    'COLD_ADDRESS3'   : COLD_ADDRESS3,
    'COLD_ADDRESS4'   : COLD_ADDRESS4,
    'COLD_ADDRESS5'   : COLD_ADDRESS5,
    "ADDRESSES"       : ADDRESSES,
    'ABI'             : ABI
}

module.exports = WEB3
/**
 * @description Web3变量 
 * @typedef { Object } Web3
 * @property { string } PROVIDER 底层通讯服务提供器
 * @property { string } CONTRACT_ADDRESS 合约地址
 * @property { string } USDT_COIN 发币账号
 * @property { string } HOT_ADDRESS  热钱包
 * @property { string } COLD_ADDRESS1 账号1
 * @property { string } COLD_ADDRESS2 账号2
 * @property { string } COLD_ADDRESS3 账号3
 * @property { string } COLD_ADDRESS4 账号4
 * @property { string } COLD_ADDRESS5 账号5
 * @property { array } ADDRESSES 冷热账号集合
 * @property { array } ABI  合约ABI
 */