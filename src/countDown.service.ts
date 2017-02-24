export function countDown(callBack: Function) {
    let count = 10;

    let timer = setInterval( _ => {
        // console.log(`count:${count}`);
        callBack(count);
        count--;
        if (count === 0) {
            clearInterval(timer);
        }
    }, 1000);
}