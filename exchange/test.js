// @ts-check
function StartJob(){
    setTimeout(function(){
        try {
            handlerTransferActions();
        } catch (error) {
            console.error(`定时器层异常`, error);
        }
        StartJob()
    }, 2000)
}
StartJob();



function handlerTransferActions() {
    const promise = new Promise( ( resolve , reject ) => {
        console.log(Date.now());
        resolve();
    });
    return promise ;
}