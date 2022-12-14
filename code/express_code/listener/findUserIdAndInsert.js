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


//修改统计表格，公用的部分
function findUserIdAndInsert(account, mysqlProcess, errState) {

    pool.getConnection((err, connection) => {
        //查找该地址对应的 user_id
        connection.query(sqlStatement.queryUserIdByAccount, account, (err, result) => {
            if (err) {
                console.log("RunTimeError when queryUserIdByAccount");
                console.dir(err);
            } else {
                //account表中没有这个user_id
                if (result.length == 0) {
                    console.log("[ERROR]account表中地址没有对应的用户ID");
                    //出错情况
                    return;
                }
                //account表中有一个或者多个用户
                else {
                    console.log(account + "的拥有账户的user_id是 : ");
                    //对每个账户进行操作
                    result.map((item, i) => {
                            // console.log("user_id = " + item);
                            console.log("user_id = " + item.user_id);
                            //统计表中有没有，没有的话要新增
                            connection.query(sqlStatement.queryByUserId, item.user_id, (err, result) => {
                                if (err) {
                                    console.log("RunTimeError when queryByUserId");
                                    console.dir(err);
                                } else {
                                    //统计表中没有这个用户的数据
                                    if (result.length == 0) {
                                        //给这个用户新增
                                        connection.query(sqlStatement.insertLineByUserId, item.user_id, (err, result) => {
                                            if (err) {
                                                console.log("RunTimeError when insertLineByUserId");
                                                console.dir(err);
                                            } else {
                                                if (mysqlProcess.length > 1) {
                                                    //累加传入的值
                                                    connection.query(mysqlProcess[0], [mysqlProcess[1], item.user_id], (err, result) => {
                                                        if (err) {
                                                            console.log(errState);
                                                            console.log(err);
                                                        }
                                                    });
                                                } else {
                                                    //自增1
                                                    connection.query(mysqlProcess[0], item.user_id, (err, result) => {
                                                        if (err) {
                                                            console.log(errState);
                                                            console.log(err);
                                                        }
                                                    });
                                                }
                                            } //end else
                                        });
                                    }
                                    //统计表中没有这个用户的数据
                                    else {
                                        if (mysqlProcess.length > 1) {
                                            //累加传入的值
                                            connection.query(mysqlProcess[0], [mysqlProcess[1], item.user_id], (err, result) => {
                                                if (err) {
                                                    console.log(errState);
                                                    console.log(err);
                                                }
                                            });
                                        } else {
                                            //自增1
                                            connection.query(mysqlProcess[0], item.user_id, (err, result) => {
                                                if (err) {
                                                    console.log(errState);
                                                    console.log(err);
                                                }
                                            });
                                        }
                                    }
                                } //end inner else

                            }); //end queryByUserId
                        }) //end mapping

                } //end else
            } //end outer else

        }); //end queryUserIdByAccount
        connection.release();
    })
}

//在node中引出文件的写法
module.exports = findUserIdAndInsert;