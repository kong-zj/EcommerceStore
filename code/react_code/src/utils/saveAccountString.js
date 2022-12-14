import axios from "axios";
import { message } from 'antd';

//保存该用户的地址信息
const saveAccountString = (username, accountString) => {
    console.log("进入函数 saveAccountString , username = " + username + " , accountString = " + accountString);
    axios.post("/account/insertOrUpdate", {
        username: username,
        accountString: accountString
    }).then(response => {
        const data = response.data;
        //成功插入
        if (data.status === "insert") {
            console.log("添加当前地址到数据库成功");
            message.success('当前地址已绑定', 3);
            //已经存在
        } else if (data.status === "update") {
            console.log("当前地址的活跃时间更新成功");
            message.success('欢迎回来', 4);
        } else {
            console.log("添加当前地址到数据库失败, data.status为 : ");
            console.dir(data.status);
            message.warning('地址绑定失败', 5);
        }
    }).catch(err => {
        console.log("向数据库添加或更新地址的请求失败, ERR : " + err);
    });
}

export default saveAccountString;