// 引入mysql
const mysql = require('mysql');
// 引入mysql连接配置
const mysqlConfig = require('../config/mysql');
// 引入连接池配置
const poolExtend = require('./db/poolExtend');
//引入sql语句封装
const sqlStatement = require('./db/sql-user.js');
//随机数生成器
const generateRandom = require('../config/generateRandomNumber');
const email = require("emailjs");
// 使用连接池，提升性能
const pool = mysql.createPool(poolExtend({}, mysqlConfig));

console.log("进入 modules/handleUser.js");

const userData = {
    rand: generateRandom(6),
    //登录
    login: (param, res) => {
        console.log("调用 userData 的 login 方法");
        pool.getConnection((err, connection) => {
            //查找是否有该用户名
            connection.query(sqlStatement.queryByUsername, param.username, (err, result) => {
                if (err || result.length === 0) {
                    const result = { status: 'failed' };
                    res.send(JSON.stringify(result));
                } else {
                    //有该用户
                    if (result[0].password === param.password) {
                        //密码正确，返回个人信息(字典形式)
                        const r = { status: 'success', username: result[0].username, email: result[0].email };
                        res.send(JSON.stringify(r));
                    } else {
                        const result = { status: 'failed' }
                        res.send(JSON.stringify(result));
                    }
                }
            })
            connection.release();
        })
    },
    //注册
    register: (param, res) => {
        console.log("调用 userData 的 register 方法");
        pool.getConnection((err, connection) => {
            //用来搜索的字串
            let queryContent = '';
            //指定查询方式
            let queryType = 0;
            if (param.username !== undefined) {
                //指定了用户name，用name查询
                queryContent = param.username;
                queryType = 1;
            } else {
                //未指定用户name，用email查询
                queryContent = param.email;
                queryType = 2;
            }
            connection.query((queryType === 1 ? sqlStatement.queryByUsername : sqlStatement.queryByEmail), queryContent, (err, result) => {
                if (err || result.length === 0) {
                    //命名无冲突
                    if (param.username !== undefined && param.email !== undefined) {
                        //封装的sql语句的参数，用数组形式传入
                        connection.query(sqlStatement.insertUser, [param.username, param.password, param.email], (err) => {
                            //在数据库中添加该用户
                            if (!err) res.send(JSON.stringify({ status: 'success' }));
                            else res.send(JSON.stringify({ status: 'failed' }));
                        })
                    } //用户提交的信息不全
                    else res.send(JSON.stringify({ status: 'noRepeated' }));
                } //命名冲突
                else res.send(JSON.stringify({ status: 'repeated' }));
            })
            connection.release();
        })
    },
    //修改密码
    alterPwd: (param, res) => {
        console.log("调用 userData 的 alterPwd 方法");
        const { newPassword, oldPassword, email } = param;
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryByEmail, email, (err, result) => {
                if (err || result.length === 0) res.send(JSON.stringify({ status: 'failed' }));
                else {
                    //旧密码正确
                    if (result[0].password === oldPassword) {
                        //把旧密码更新成新密码
                        connection.query(sqlStatement.updatePassword, [newPassword, email], err => {
                            if (err) res.send(JSON.stringify({ status: 'failed' }));
                            else res.send(JSON.stringify({ status: 'success' }));
                        })
                    } else {
                        //旧密码不正确
                        res.send(JSON.stringify({ status: 'failed' }));
                    }
                }
            })
            connection.release();
        })
    },
    //发送验证码
    sendSecurityCode: (param, res) => {
        console.log("调用 userData 的 sendSecurityCode 方法");
        const userEmail = param.email;
        //即时运算出验证码
        const code = generateRandom(6);
        //更新 rand，为了在 forgetPwd 中比较是否与用户输入的验证码相符

        this.rand = code;

        const server = new email.SMTPClient({
            user: "120430425@qq.com", // 用于服务的QQ用户
            password: "uehnofwcsdvwcbab", // 不是QQ密码，而是生成的授权码
            host: "smtp.qq.com", // 主机，不改
            ssl: true // 使用ssl
        });
        //开始发送邮件
        server.send({
            text: `您的验证码为：${code}，60秒后过期。`, //邮件内容
            from: "120430425@qq.com", //谁发送的
            to: userEmail, //发送给谁的
            subject: "【区块链溯源艺术收藏品拍卖平台】验证码" //邮件主题
        }, function(err, message) {
            //回调函数
            console.log(err || message);
            if (err) {
                res.send(JSON.stringify({ status: 'failed' }));
            } else {
                res.send(JSON.stringify({ status: 'success' }));
            }
        });
    },
    //忘记密码
    forgetPwd: (param, res) => {
        console.log("调用 userData 的 forgetPwd 方法");
        const { newPassword, securityCode, email } = param;
        if (securityCode !== this.rand) {
            res.send(JSON.stringify({ status: 'wrong' }));
            return;
        }
        //更新验证码，防止旧验证码泄露
        this.rand = generateRandom(6);
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryByEmail, email, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({ status: 'failed' }));
                } else if (result.length === 0) {
                    res.send(JSON.stringify({ status: 'unRegister' }));
                } else {
                    //找到该用户的信息
                    connection.query(sqlStatement.updatePassword, [newPassword, email], err => {
                        if (err) {
                            console.log(err);
                            res.send(JSON.stringify({ status: 'failed' }));
                            //成功更新密码
                        } else res.send(JSON.stringify({ status: 'success' }));
                    })
                }
            })
            connection.release();
        })
    }
};
module.exports = userData;