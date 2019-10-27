//@ts-check
const sleep = require("./sleep")
const {END_POINT} = require("../common/constant/eosConstants")
/**
 * 判断是否6次确认

 * @returns {Promise<boolean>}
 */
async function is6confirm(){
    try{
        let trx = 0
        let latest_block =  1

        while(1){
            
            if((latest_block-trx+1)>=6){
                if(trx){
                    return true
                }
                break
            }
            latest_block +=1;
            console.log('latest_block:',latest_block)
            
            await sleep(1000)
        }
        return false
    }
    catch(err){
        console.log("err from is6confirm(),ths track is %O:",err);
        throw err
    }
}
;(async()=>{
    console.log(END_POINT)
})()