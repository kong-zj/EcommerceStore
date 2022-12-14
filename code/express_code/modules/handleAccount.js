// 引入mysql
const mysql = require('mysql');
// 引入mysql连接配置
const mysqlConfig = require('../config/mysql');
// 引入连接池配置
const poolExtend = require('./db/poolExtend');
//引入sql语句封装
const sqlStatement = require('./db/sql-account.js');
const email = require("emailjs");
// 使用连接池，提升性能
const pool = mysql.createPool(poolExtend({}, mysqlConfig));

console.log("进入 modules/handleAccount.js");

const accountData = {


    //用户使用一个地址时
    insertOrUpdate: (param, res) => {
        console.log("调用 accountData 的 insertOrUpdate 方法");
        const { username, accountString } = param;
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryByUsernameAndAccount, [username, accountString], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({ status: 'failed' }));

                    //用户还没有用过这个地址，插入这个地址
                } else if (result.length === 0) {
                    connection.query(sqlStatement.insertAccount, [accountString, username], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send(JSON.stringify({ status: 'failed' }));
                        } else {
                            //插入地址成功
                            res.send(JSON.stringify({ status: 'insert' }));
                        }
                    })

                    //用户用过这个地址，更新这个地址的最后使用时间
                } else {
                    connection.query(sqlStatement.updateTimeByUsername, [username, accountString], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send(JSON.stringify({ status: 'failed' }));
                        } else {
                            //更新时间成功
                            res.send(JSON.stringify({ status: 'update' }));
                        }
                    })

                }
            })
            connection.release();
        })

    },
    //用户要求删除一个地址
    deleteOne: (param, res) => {
        console.log("调用 accountData 的 deleteOne 方法");
        const { username, accountString } = param;
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.deleteOneByUsername, [username, accountString], (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({ status: 'failed' }));
                } else {
                    //成功删除
                    res.send(JSON.stringify({ status: 'success' }));
                }
            })
            connection.release();
        })

    },
    //用户要求删除所有地址
    deleteAll: (param, res) => {
        console.log("调用 accountData 的 deleteAll 方法");
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.deleteAllByUsername, param.username, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({ status: 'failed' }));
                } else {
                    //成功删除
                    res.send(JSON.stringify({ status: 'success' }));
                }
            })
            connection.release();
        })

    },
    //用户要求看自己曾用过的所有地址
    showAll: (param, res) => {
        console.log("调用 accountData 的 showAll 方法");
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryByUsername, param.username, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({ status: 'failed' }));
                } else {
                    //返回所有地址(字典形式)
                    //注意这里传递字典数组(JSON)
                    console.log("用户username = " + param.username + " 的所有地址为 : ");
                    console.dir(result);
                    const r = { status: 'success', accountAndLastTime: result };
                    res.send(JSON.stringify(r));
                }
            })
            connection.release();
        })
    }


};
module.exports = accountData;