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

function NewBidEventListener() {

    console.log("监听器 NewBidEventListener 成功开启");

    EcommerceStore.deployed().then(i => {
        console.log("监听器 NewBidEventListener 中的 EcommerceStore合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let productEvent = i.NewBid({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 NewBid 事件，立即处理");
            if (error) {
                console.log("监听 NewBid 的回调函数出错 : " + error);
                return;
            }
            saveBid(result.args);
            //result.args中有两个成员 (uint _productId, address _bidder);
        });
    });
}


function saveBid(bid) {
    //bid._productId
    //bid._bidder
    console.log("进入监听器 NewBidEventListener 的附属函数 savebid");
    //抽象出公用的在account表中查找，并可能存在插入统计表的行为
    findUserIdAndInsert(bid._bidder, [sqlStatement.addBidNumByUserId], "bid_num+1失败");
}

module.exports = NewBidEventListener;