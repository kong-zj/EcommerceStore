//包装好的 Product mongodb数据库对象，直接使用
const ProductModel = require('./db/mongo-product');
// 引入mysql
const mysql = require('mysql');
// 引入mysql连接配置
const mysqlConfig = require('../config/mysql');
// 引入连接池配置
const poolExtend = require('./db/poolExtend');
//引入sql语句封装
const sqlStatement = require('./db/sql-statistics.js');
//随机数生成器
const generateRandom = require('../config/generateRandomNumber');
const email = require("emailjs");
// 使用连接池，提升性能
const pool = mysql.createPool(poolExtend({}, mysqlConfig));

console.log("进入 modules/handleDevice.js");

const StatisticsData = {

    //req是当前的userName

    //托管合约总资金流水
    getEscrowThrough: (req, res) => {
        console.log("调用 StatisticsData 的 getEscrowThrough 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.querySumEscrowThrough, req, (err, result) => {
                console.log("----------SumEscrowThrough 为 ");
                res.send(JSON.stringify(result[0].sum));

            })
            connection.release();
        })
    },

    //成功交易的资金百分比
    getSuccessPrecent: (req, res) => {
        console.log("调用 StatisticsData 的 getSuccessPrecent 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.querySumEscrowThrough, req, (err, escrow) => {
                let sumEscrowThrough = escrow[0].sum;
                connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                    if (err) {
                        console.log(err);
                    } else {
                        //一个 userId
                        userId.map((item, i) => {
                            console.dir(item.id);
                            connection.query(sqlStatement.querySellEarnByUserId, item.id, (err, result) => {
                                result.map((sell, i) => {
                                    console.log(sell.sell_earn + " +++++++++++++ / +++++++++++++ " + sumEscrowThrough);
                                    res.send(JSON.stringify(sell.sell_earn / sumEscrowThrough * 100));
                                });

                            });
                        });
                    }
                });
            })
            connection.release();
        })
    },

    //产品总数
    getProductAllNum: (req, res) => {
        console.log("调用 StatisticsData 的 getProductAllNum 方法");
        //查mongo数据库
        ProductModel.find({}, null, {}, (err, items) => {
            if (err) {
                console.log(err);
            } else {
                console.log("--------------------查找到" + items.length + "个数据");
                //发给前端
                res.send(JSON.stringify(items.length));
            }
        });
    },

    //该用户发布的产品数
    getProductUserNum: (req, res) => {
        console.log("调用 StatisticsData 的 getProductUserNum 方法");
        //先mysql
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                if (err) {
                    console.log(err);
                } else {
                    //一个 userId
                    userId.map((item, i) => {
                        console.dir(item.id);
                        connection.query(sqlStatement.queryAccountByUserId, item.id, (err, accountStringArray) => {
                            let queryArray = [];
                            //多个 accountString
                            for (let i = 0; i < accountStringArray.length; i++) {
                                console.log("----------------account = " + accountStringArray[i].accountString);
                                queryArray.push(accountStringArray[i].accountString);

                            } // end for
                            console.log("该用户所有的地址为 : ");
                            console.dir(queryArray);

                            //查询条件
                            let query = {};
                            query['seller'] = { $in: queryArray };
                            //后mongo
                            ProductModel.find(query, null, {}, (err, items) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("--------------------查找到" + items.length + "个数据");
                                    res.send(JSON.stringify(items.length));
                                }
                            });

                        }); // end connection.query

                    }); // end userId.map
                } // end else 


            }); // end connection.query
            connection.release();
        })
    },

    //该用户竞价次数
    getBidUserNum: (req, res) => {
        console.log("调用 StatisticsData 的 getBidUserNum 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                if (err) {
                    console.log(err);
                } else {
                    //一个 userId
                    userId.map((item, i) => {
                        console.dir(item.id);
                        connection.query(sqlStatement.queryBidNumByUserId, item.id, (err, result) => {
                            result.map((bid, i) => {
                                res.send(JSON.stringify(bid.bid_num));
                            });

                        });
                    });


                }


            });
            connection.release();
        })
    },

    //该用户购买的商品数
    getBuyUserNum: (req, res) => {
        console.log("调用 StatisticsData 的 getBuyUserNum 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                if (err) {
                    console.log(err);
                } else {
                    //一个 userId
                    userId.map((item, i) => {
                        console.dir(item.id);
                        connection.query(sqlStatement.queryBuyNumByUserId, item.id, (err, result) => {
                            result.map((buy, i) => {
                                res.send(JSON.stringify(buy.buy_num));
                            });

                        });
                    });


                }


            });
            connection.release();
        })
    },

    //该用户出售所得
    getSellEarn: (req, res) => {
        console.log("调用 StatisticsData 的 getSellEarn 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                if (err) {
                    console.log(err);
                } else {
                    //一个 userId
                    userId.map((item, i) => {
                        console.dir(item.id);
                        connection.query(sqlStatement.querySellEarnByUserId, item.id, (err, result) => {
                            result.map((sell, i) => {
                                res.send(JSON.stringify(sell.sell_earn));
                            });

                        });
                    });
                }
            });
            connection.release();
        })
    },

    //该用户仲裁所得
    getArbitEarn: (req, res) => {
        console.log("调用 StatisticsData 的 getArbitEarn 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryIdByUserName, req, (err, userId) => {
                if (err) {
                    console.log(err);
                } else {
                    //一个 userId
                    userId.map((item, i) => {
                        console.dir(item.id);
                        connection.query(sqlStatement.queryArbitEarnByUserId, item.id, (err, result) => {
                            result.map((arbit, i) => {
                                res.send(JSON.stringify(arbit.arbit_earn));
                            });

                        });
                    });
                }
            });
            connection.release();
        })
    },



};
module.exports = StatisticsData;