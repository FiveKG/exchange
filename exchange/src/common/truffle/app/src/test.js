//@ts-check
const {ADDRESSES, CONTRACT_ADDRESS,USDT_COIN,HOT_ADDRESS,COLD_ADDRESS4,COLD_ADDRESS5,COLD_ADDRESS1,COLD_ADDRESS2,ABI,PROVIDER,UE_TOKEN,TBG_TOKEN,WALLET_RECEIVER} = require("../../../../common/constant/web3Config")
const { redis } = require("../../../../common");
const sleep = require("../../../../job/sleep")
const Web3 = require('web3')
//let web3 = new Web3("http:// 172.19.2.122:39842");
let web3 = new Web3("http://localhost:8545");
if(typeof web3 !=='undefined'){ //检查是否已有web3实例
    web3=new Web3(web3.currentProvider);
}else{
    //否则就连接到给出节点
    web3=new Web3();
    web3.setProvider(new Web3.providers.WebsocketProvider("http://localhost:8545"));//注意这里注意端口不用一致，直接默认8546即可（若刚刚启动节点的rpc端口是8545的情况下）
}
const contract =new web3.eth.Contract(ABI,CONTRACT_ADDRESS)

const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder(ABI);
const { Decimal } = require("decimal.js");


const g22p33s ='0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2'


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

        web3.eth.personal.unlockAccount(USDT_COIN,'123',10000)
            contract.methods.transfer("0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2",10000).send({from:USDT_COIN})
            .on('transactionHash', function(hash){
                console.log("transactionHash",hash)
            })



        // contract.methods.transfer(COLD_ADDRESS1,10000).send({from:"0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2"})
        // .on('transactionHash', function(hash){
        //     console.log("11g22p33s");
        //     console.log(hash);
        //     console.log(g22p33s);
        //     console.log(COLD_ADDRESS1)
        // })

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
        console.log("err getTokenBalance:",err);
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

    // const passwd = await web3.eth.accounts.decrypt({"address":"4f9e1512a28a13424dd1aa65c7b07cbef6a1523b","crypto":{"cipher":"aes-128-ctr","ciphertext":"7413383e7545510fb31726e92d7213788b6f89082a88b19fce78f7e192f25648","cipherparams":{"iv":"8eb90b6a4556067c87f5d3ba6d5683a2"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"75c5bfe940082960be5cba9af151660a9af787079ec467ead7e5209ec2fb7f35"},"mac":"81fffce240b14710575ea650a1c2d87989a7002b20a75098e82b6f535cda5799"},"id":"ac1cc69a-6b14-44ce-a7f5-15cca1656bca","version":3},"123");
    // console.log(passwd)
  await transfer()
//     const keystoreJsonV3 = {"address":"2a7af4e48f25a751ddb9d0174738e01d0a2743c2","crypto":{"cipher":"aes-128-ctr","ciphertext":"fbaea16a6fb68f50acbdf6a3b388e2dab97c0e334a0514763dc67b1952bf5028","cipherparams":{"iv":"5feba34b5180e0997bd6288d1183a224"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"9a3b2f13f51eae0b09cf239aed0cd8ed9cd40074808bb02a233b0eea85ead176"},"mac":"2c82853f9f2da8bba30565253c5f5d64d5b36a4a55e9524ff5fdb8fc7a3d5535"},"id":"2a94090c-2966-4c2f-866a-27e810ef412d","version":3};
//     const result = await web3.eth.accounts.decrypt(keystoreJsonV3, '123');
//  console.log(result)
    // web3.eth.personal.unlockAccount(USDT_COIN,'123',3000)
    // web3.eth.sendTransaction({
    //     from: USDT_COIN,
    //     to: "0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2",
    //     value: '1000000000000000'
    // })
    // .then(function(receipt){
    //     console.log(receipt)
    // })
    // web3.eth.sendTransaction({
    //     from: USDT_COIN,
    //     to: "0x9571D6c7bBE67DD4655a9B7C65b1a4a0C95A7A90",
    //     value: '1000000000000000'
    // })
    // .then(function(receipt){
    //     console.log(receipt)
    // })
    // web3.eth.sendTransaction({
    //     from: '0x2a6f0e7ce6cb445cb8d1928274792dab9f28107c',
    //     to: TEST3,
    //     value: '1000000000000000'
    // })
    // .then(function(receipt){
    //     console.log(receipt)
    // })

    //console.log(await getTokenBalance("0x2a7af4e48f25a751ddb9d0174738e01d0a2743c2"))
    // const result = await web3.eth.getBlock(9048)
    // console.log()
    //console.log(new Date(result.timestamp*1000))
    
    //console.log(await web3.eth.getTransactionReceipt("0xfe7f152e943145f14fd305273e70edd408a06e223790c7a78b1fccd8f1ecf764"));
   // await transfer_info("0x1216615bd9105f895df7d32dd293481fcbc971e0267d436869147dd905aca017")



    // console.log(await getTokenBalance("0xE543732c26f84A83E7FcE1fE9479376400344d5D"))

    // console.log(await getTokenBalance("0x31674f9E16f74C4F123eE98F1549E5eb7b317E5f"))
    // console.log(await getTokenBalance("0x2aB522e2126E653e785e56410451D41D3fed10ea"))


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