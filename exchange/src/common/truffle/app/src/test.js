//@ts-check
const {CONTRACT_ADDRESS,ACC0,ACC1,ABI,PROVIDER} = require("../../../../common/constant/web3Config")
const Web3 = require('web3')
let web3 = new Web3(PROVIDER||'http://192.168.1.103:8545');
const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)
const BigNumber = require('bignumber.js');
const Tx = require("ethereumjs-tx")



contract.methods.name().call().then(name=>console.log('name:',name))
contract.methods.symbol().call().then(values=>console.log("symbol:",values))
contract.methods.balanceOf(ACC0).call().then(values=>{
    console.log('acc0 USTD balance:',values);
}).catch(function(err){
    console.log(err)
})

async function test(){
    const balance = await 
}
console.log("option",contract.options)
const addr_from = ACC0;
const addr_to = ACC1;

// 补齐64位，不够前面用0补齐
/**
 * 
 * @param {any} num 
 */
function addPreZero(num){
    var t = (num+'').length,
    s = '';
    for(var i=0; i<64-t; i++){
      s += '0';
    }
    return s+num;
  }


// //获取转账信息 ACC0->contract->ACC1
// web3.eth.getTransactionCount(addr_from, web3.eth.defaultBlock,(err, txCount) => {

//     web3.eth.personal.unlockAccount(addr_from,'123',1000)
//     //私链转账
//     // let transfer_info = {
//     //     nonce:    txCount++, 
//     //     from: addr_from,
//     //     gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'gwei')),
//     //     gasLimit: contract.methods.gasLimit,
//     //     to: addr_to,
//     //     data: contract.methods.transfer(addr_to, 12).encodeABI()
//     // }
//     // contract.methods.transfer(CONTRACT_ADDRESS,"0").send(transfer_info).then(console.log)
//     // console.log('========>',txCount)

//     //主链转账
//     const txObject = {
//       nonce:    web3.utils.toHex(txCount++), 
//       gasLimit: web3.utils.toHex(99000), // Raise the gas limit to a much higher amount
//       gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'gwei')),
//       to: CONTRACT_ADDRESS,
//       from:ACC1,
//       // 调用合约转账value这里留空
//       value: '0x00', 
//       //chainId:web3.utils.toHex(15),
//       data: contract.methods.transfer(addr_to, 12).encodeABI()
//     }
//     const tx = new Tx(txObject)
    
//     const privateKey = new Buffer("b6898d9865c7f240ce99599325c7e9e721feae6f0b85717109317ce4a6e667d5",'hex')
//     tx.sign(privateKey)

//     const serializedTx = tx.serialize().toString('hex')
//     const raw = '0x' + serializedTx.toString('hex')
    
//     web3.eth.sendSignedTransaction(raw, (err, txHash) => {
//       console.log('err!!!!:', err, 'txHash:', txHash)
//     })
//   })




//  contract.methods.transfer(addr_to,10).send();