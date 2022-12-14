//将以毫秒为单位的时间段长度，转化为易于理解的字符串


function simpleDuration(duration) {
    // if (type === 's') {
    //     duration = duration * 1000;
    // }

    if (duration < 0) {
        return "0秒";
    }
    //参数为正
    else {
        let str = '';
        let days = '',
            hours = '',
            minutes = '',
            seconds = '';
        let day = 24 * 60 * 60 * 1000,
            hour = 60 * 60 * 1000,
            minute = 60 * 1000,
            second = 1000;
        if (duration >= day) {
            days = Math.floor(duration / day) + '天';
            hours = Math.floor(duration % day / hour) + '小时';
        } else if (duration >= hour && duration < day) {
            hours = Math.floor(duration / hour) + '小时';
            minutes = Math.floor(duration % hour / minute) + '分钟';
        } else if (duration > minute && duration < hour) {
            minutes = Math.floor(duration / minute) + '分钟';
            seconds = Math.floor(duration % minute / second) + '秒';
        } else if (duration <= minute) {
            seconds = Math.floor(duration / second) + '秒';
        }
        return days + hours + minutes + seconds;
    }

}

export default simpleDuration;