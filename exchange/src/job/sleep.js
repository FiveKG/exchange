// @ts-check

/**
 * 
 * @param { number } ms 
 */
async function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
}

module.exports = sleep;