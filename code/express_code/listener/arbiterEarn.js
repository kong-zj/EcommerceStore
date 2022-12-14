const EcommerceStore = require('../modules/contracts/contract-ecommerceStore');
// 引入mysql
const mysql = require('mysql');
// 引入mysql连接配置
const mysqlConfig = require('../config/mysql');
// 引入连接池配置
const poolExtend = require('../modules/db/poolExtend');
//引入sql语句封装
const sqlStatement = require('../modules/db/sql-statistics.js');
// 使用连接池，提升性能
const pool = mysql.createPool(poolExtend({}, mysqlConfig));

//抽象公用部分
const findUserIdAndInsert = require('./findUserIdAndInsert');

//仲裁收入
// event arbiterEarn(uint _productId, uint _amount, address _beneficiary);

function arbiterEarnEventListener() {

    console.log("监听器 arbiterEarnEventListener 成功开启");

    EcommerceStore.deployed().then(i => {
        console.log("监听器 arbiterEarnEventListener 中的 EcommerceStore合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let productEvent = i.ArbiterEarn({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 ArbiterEarn 事件，立即处理");
            if (error) {
                console.log("监听 ArbiterEarn 的回调函数出错 : " + error);
                return;
            }
            saveArbiterEarn(result.args._beneficiary, result.args._amount);
            //result.args中有 uint _amount, address _beneficiary
        });
    });
}


function saveArbiterEarn(account, amount) {

    console.log("进入监听器 arbiterEarnEventListener 的附属函数 savebid");
    //抽象出公用的在account表中查找，并可能存在插入统计表的行为
    findUserIdAndInsert(account, [sqlStatement.addArbitEarnByUserId, parseInt(amount)], "arbiter_earn修改失败");
}

module.exports = arbiterEarnEventListener;