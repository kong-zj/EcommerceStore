//时间格式化
import simpleDuration from './timeDuration';

const handleTimeString = (auctionEndTime, process) => {
    let processTimeString = undefined;
    if (process === "sell") {
        //注意时间的几种不同的格式，格式相同才能相减
        //注意这里 *1000, 因为要把单位统一为 ms 进行计算
        let timeDifference = auctionEndTime * 1000 - new Date().getTime();
        processTimeString = "还剩 " + simpleDuration(timeDifference);

    } else if (process === "reveal") {
        //这里的揭示报价时间暂时写死了
        let timeDifference = auctionEndTime * 1000 - new Date().getTime() + 1000 * 60 * 5;
        processTimeString = "还剩 " + simpleDuration(-timeDifference);

    } else if (process === "finalize") {
        let timeDifference = new Date().getTime() - auctionEndTime * 1000;
        processTimeString = "已过去 " + simpleDuration(timeDifference);
    }
    return processTimeString;
}

export default handleTimeString;