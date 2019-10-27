//@ts-check
const {CONTRACT_ADDRESS,ACC0,ACC1,ACC2,ABI,PROVIDER,UE_TOKEN,TBG_TOKEN,WALLET_RECEIVER} = require("../../../../common/constant/web3Config")
const { redis } = require("../../../../common");
const sleep = require("../../../../job/sleep")
const Web3 = require('web3')
let web3 = new Web3("ws://localhost:8545");
const moment = require('moment')

if(typeof web3 !=='undefined'){ //检查是否已有web3实例
    web3=new Web3(web3.currentProvider);
}else{
    //否则就连接到给出节点
    web3=new Web3();
    web3.setProvider(new Web3.providers.WebsocketProvider("ws://localhost:8545"));//注意这里注意端口不用一致，直接默认8546即可（若刚刚启动节点的rpc端口是8545的情况下）
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


const addr_from = ACC0;
const addr_to = ACC1;


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
        web3.eth.personal.unlockAccount(ACC0,'123',3000)
        web3.eth.personal.unlockAccount(ACC1,'123',3000)
        web3.eth.personal.unlockAccount(ACC2,'123',3000)
        //ACC1->tbgtokencoin

  
            const result0 = await contract.methods.transfer("0x0C4575771c38D71F0785924DFC6349B6aC643e18",101).send({from:ACC0});
            const result1 = await contract.methods.transfer("0x84A5093a0D335bbB630149545B2f3Af965686656",101).send({from: ACC2});
            console.log(result0,result1)
        
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

        console.log("decodeParameters:",transfer_info)
        //@ts-ignore
        const result = decoder.decodeData(input);


    }catch(err){
        console.log("err transfer_info:",err)
    }

}




//transfer_info("0x369d9e2d92dc6f6ed046eebfab1d18dfeea87f79b535db85fa224bc30dcc6683")
/**
 * 监听智能合约账号的转账记录
 */

 async function test(){

    await transfer()
    //console.log(process.env.EOS_END_POINT)
    // web3.eth.personal.unlockAccount(ACC0,'123',3000)
    // web3.eth.sendTransaction({
    //     from: '0x2a6f0e7ce6cb445cb8d1928274792dab9f28107c',
    //     to: '0xd73b2c72435276c98a1266db457fbcd0c2d2bf28',
    //     value: '100000000000000'
    // })
    // .then(function(receipt){
    //     console.log(receipt)
    // })

    // console.log(await getTokenBalance(UEACC))
   // transfer_info("0x02a1b0973a823b71d673fd15ecc656bd3b73e249226615fc8432aacc4740553a")
    // console.log(await web3.eth.getBlock(10023))
   // console.log(await web3.eth.getTransactionReceipt("0x02a1b0973a823b71d673fd15ecc656bd3b73e249226615fc8432aacc4740553a"));
    //console.log(await web3.eth.getTransaction("0x02a1b0973a823b71d673fd15ecc656bd3b73e249226615fc8432aacc4740553a"))
    


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