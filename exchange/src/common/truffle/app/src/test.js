//@ts-check
const {CONTRACT_ADDRESS,USDT_COIN,HOT_ADDRESS,COLD_ADDRESS1,COLD_ADDRESS2,ABI,PROVIDER,UE_TOKEN,TBG_TOKEN,WALLET_RECEIVER} = require("../../../../common/constant/web3Config")
const { redis } = require("../../../../common");
const sleep = require("../../../../job/sleep")
const Web3 = require('web3')
//let web3 = new Web3("http:// 172.19.2.122:39842");
let web3 = new Web3("http:192.168.1.105:8545");
const moment = require('moment')

if(typeof web3 !=='undefined'){ //检查是否已有web3实例
    web3=new Web3(web3.currentProvider);
}else{
    //否则就连接到给出节点
    web3=new Web3();
    web3.setProvider(new Web3.providers.WebsocketProvider("http://192.168.1.105:8545"));//注意这里注意端口不用一致，直接默认8546即可（若刚刚启动节点的rpc端口是8545的情况下）
}

const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(ABI);
const { Decimal } = require("decimal.js");
const Tx = require("ethereumjs-tx");
const UEACC = "0xe10ee4f719e8ad5eb16a665b6f46116ce259ad1b";


contract.methods.name().call().then(name=>console.log('name:',name))
contract.methods.symbol().call().then(values=>console.log("symbol:",values))


/**
 * 查询合约账号的历史事件，每次查询一个区块的所有交易数据
 * @param {Number} fromBlock 从第几块区查起，默认是0

 */
async function getContractTransaction(fromBlock=0){
    try{
        const event = await contract.getPastEvents('Transfer',{
            fromBlock:fromBlock,
            toBlock: "latest"
        })
        return event

    }catch(err)
    {
        console.log("err from getContractTransaction(),ths track is %O:",err)
    }
}




// //获取转账信息 ACC0->contract->ACC1
// web3.eth.getTransactionCount(addr_from, web3.eth.defaultBlock,(err, txCount) => {

//     web3.eth.personal.unlockAccount(addr_from,'123',1000)
//     //私链转账
//     let transfer_info = {
//         nonce:    txCount++, 
//         from: addr_from,
//         gasPrice: web3.utils.toHex(web3.utils.toWei('3', 'gwei')),
//         gasLimit: contract.methods.gasLimit,
//         to: addr_to,
//         data: contract.methods.transfer(addr_to, 12).encodeABI()
//     }
//     contract.methods.transfer(CONTRACT_ADDRESS,"0").send(transfer_info).then(console.log)
//     console.log('========>',txCount)
//   })
async function transfer(){
    try{

        //web3.eth.personal.unlockAccount(USDT_COIN,'123',10000)
        //ACC1->tbgtokencoin

            web3.eth.personal.unlockAccount(USDT_COIN,'123',10000)
            contract.methods.transfer("0x9571d6c7bbe67dd4655a9b7c65b1a4a0c95a7a90",1000000).send({from:USDT_COIN})
            .on('transactionHash', function(hash){
                console.log("transactionHash",hash)
                web3.eth.getTransaction(hash).then(console.log)
            })
            .on('confirmation', function(confirmationNumber, receipt){
                console.log("confirmationNumber,receipt",confirmationNumber,receipt)
            })
            .on('receipt', function(receipt){
                console.log("receipt",receipt)
            })

        
        console.log('done!')
        //ACC2->tbgjoin
        // const result0 = await contract.methods.transfer(ACC1,10000000000).send({from: ACC0});
        // //ACC2->tbgjoin
        // const result1 = await contract.methods.transfer(ACC2,10000000000).send({from: ACC0});
        
    
    }
    catch(err){
        console.log("transfer err:",err)
    }
}


//@ts-ignore
async function getTokenBalance(account){
    try{
        const balance = await contract.methods.balanceOf(account).call()
        return balance

    }catch(err){
        console.log("err getTokenBalance:",err)
    }

}


//@ts-ignore
async function transfer_info(hash){
    try{
        const transfer_info = await web3.eth.getTransaction(hash)
        console.log(transfer_info)
        //@ts-ignore
        const result = decoder.decodeData(transfer_info.input);
        console.log(result)

    }catch(err){
        console.log("err transfer_info:",err)
    }

}




//transfer_info("0x369d9e2d92dc6f6ed046eebfab1d18dfeea87f79b535db85fa224bc30dcc6683")
/**
 * 监听智能合约账号的转账记录
 */

 async function test(){

    // const passwd = await web3.eth.accounts.decrypt({"address":"9571d6c7bbe67dd4655a9b7c65b1a4a0c95a7a90","crypto":{"cipher":"aes-128-ctr","ciphertext":"9b6e249ee68d3d988e3716b64f91b83806416910a4f3001b41b4e16594f6d52f","cipherparams":{"iv":"1cdd8520c741c868dbd15665ceb8becc"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"ee2b8dc276802b0599e0ae035ea583d94f86c69ecfb17cfbec31f23518a0dbb0"},"mac":"f7ae2939a4cc77bf5101266ca0e66928e85cd85cbe4fb878d422d306873b9000"},"id":"2aa58b17-8dbb-4108-866c-9de6c6e73440","version":3},"123");
    // console.log(passwd)
    //await transfer()

    //console.log(process.env.EOS_END_POINT)
    // web3.eth.personal.unlockAccount(USDT_COIN,'123',3000)
    // web3.eth.sendTransaction({
    //     from: '0x2a6f0e7ce6cb445cb8d1928274792dab9f28107c',
    //     to: '0x9571d6c7bbe67dd4655a9b7c65b1a4a0c95a7a90',
    //     value: '1000000000000000'
    // })
    // .then(function(receipt){
    //     console.log(receipt)
    // })

    console.log(await getTokenBalance("0x9571d6c7bbe67dd4655a9b7c65b1a4a0c95a7a90"))
    // const result = await web3.eth.getBlock(9048)
    // console.log()
    //console.log(new Date(result.timestamp*1000))
    //console.log(await web3.eth.getTransactionReceipt("0xfe7f152e943145f14fd305273e70edd408a06e223790c7a78b1fccd8f1ecf764"));
    //await transfer_info("0xfe7f152e943145f14fd305273e70edd408a06e223790c7a78b1fccd8f1ecf764")



    // console.log(await getTokenBalance(ACC0))

    //console.log(await getTokenBalance(ACC1))
    // console.log(await getTokenBalance(ACC1))
    // console.log(await getTokenBalance(ACC2))

    //Decimal.set({ precision:32, rounding:Decimal.ROUND_DOWN })
    // let amount = new Decimal('1.284855079553519221609493939418532947836379180315e+48')
    // let value = amount.mul(1).toDecimalPlaces(8)
    // console.log(value.toString)
    // const result= await getContractTransaction(9516)
    // console.log(result)
    //console.log(web3.eth.personal)
    // console.log(event)

    // return
 }

test()




//  contract.methods.transfer(addr_to,10).send();