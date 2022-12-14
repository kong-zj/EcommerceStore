// 模块引入
const express = require('express');
const app = express();
// const mosca = require('mosca');
const ws = require('nodejs-websocket');
// const deviceModule = require('../modules/handleMqttMessage');

//处理Product
const device = require('../modules/handleProduct');
//监听新 Product 的上链
const newProductEventListener = require('../listener/newProduct');
//监听新 Goods 的上链
const newGoodsEventListener = require('../listener/newGoods');
//监听 Goods 的库存变化
const buyGoodsEventListener = require('../listener/buyGoods');
//转卖 Product
const changeProductEventListener = require('../listener/changeProduct');
//监听 Bid 的上链
const newBidEventListener = require('../listener/newBid');
//监听 createEscrow
const createEscrowEventListener = require('../listener/createEscrow');
//监听 arbiterEarn
const arbiterEarnEventListener = require('../listener/arbiterEarn');
//监听 disburseAmount
const disburseAmountEventListener = require('../listener/disburseAmount');

// 前端 index.jsx 的 WebSocket 连接这里
// const wsProt = 4000;

// function initMqttServer() {

//     //构建自带服务器
//     // const MqttServer = new mosca.Server({
//     //     port: 1883
//     // });


//     let res = {
//         send: str => str
//     }

//     let isConnect = false;

//     let server = ws.createServer(function(socket) {
//         console.log("用户试图接入server");
//         //监听关闭
//         socket.on("close", function(code, reason) {
//             isConnect = false;
//             console.log("连接关闭，code = " + code);
//         })
//         socket.on("error", function(code, reason) {
//             isConnect = false;
//             console.log("异常关闭，code = " + code)
//         })
//         socket.on("text", function(str) {
//             if (isConnect) {
//                 console.log('重复连接')
//             } else {
//                 console.log("成功连接");
//                 //对服务器端口进行配置， 在此端口进行监听
//                 // MqttServer.on('clientConnected', async function(client) {
//                 //     let param = { deviceID: client.id };
//                 //     //监听连接
//                 //     console.log('client connected', client.id);
//                 //     deviceModule.addData(JSON.stringify({ alert: 2, info: '设备上线', timestamp: new Date().getTime() }), client.id, 'onlineRecord');
//                 //     device.setOnline(client.id);
//                 //     await device.getDeviceInfo(param, res, 1);
//                 //     setTimeout(() => {
//                 //         if (param.deviceName !== undefined) socket.sendText(param.deviceName + '已上线' + client.id);
//                 //     }, 1000)
//                 // });
//                 // MqttServer.on('clientDisconnected', async function(client) {
//                 //     let param = { deviceID: client.id };
//                 //     console.log('client disconnected', client.id);
//                 //     deviceModule.addData(JSON.stringify({ alert: 3, info: '设备下线', timestamp: new Date().getTime() }), client.id, 'offlineRecord');
//                 //     device.setOffline(client.id);
//                 //     await device.getDeviceInfo(param, res, 1);
//                 //     setTimeout(() => {
//                 //         if (param.deviceName !== undefined) socket.sendText(param.deviceName + '已离线' + client.id);
//                 //     }, 1000);
//                 // });
//                 isConnect = true;
//                 console.log('websocket已连接');
//             }
//         })
//     }).listen(wsProt);



//     // MqttServer.on('published', function(packet, client) {
//     //     //当客户端有连接发布主题消息
//     //     const topic = packet.topic;
//     //     const content = packet.payload.toString();

//     //     // console.log(Buffer.from(packet.payload).toString());
//     //     if (content[0] === '{') {
//     //         deviceModule.addData(packet.payload.toString(), JSON.parse(packet.payload.toString()).clientId, topic);
//     //     }

//     // });

//     // MqttServer.on('ready', function() {
//     //     //当服务开启时
//     //     console.log('mqtt服务器开启成功');
//     // });
// }




// //后台服务器响应前台请求
// app.use(function(req, res, next) {
//     //定义请求头的参数字段
//     //开启跨域请求
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     //继续向下执行
//     next();
// });


app.use((req, res, next) => {
    //设置请求头
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Max-Age': 1728000,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    })
    req.method === 'OPTIONS' ? res.status(204).end() : next()
})


// 路由划分，请求派发

//用户账号相关
app.use('/login', require('./routers/user/login')) //登录
app.use('/register', require('./routers/user/register')) //注册
app.use('/sendSecurityCode', require('./routers/user/sendSecurityCode')) //发验证码 
app.use('/forgetPwd', require('./routers/user/forgetPwd')) //忘记密码
app.use('/alterPwd', require('./routers/user/alterPwd')) //修改密码

//用户所属地址相关
app.use('/account/insertOrUpdate', require('./routers/account/insertOrUpdate')) //用户使用一个地址时
app.use('/account/deleteOne', require('./routers/account/deleteOne')) //用户要求删除一个地址
app.use('/account/deleteAll', require('./routers/account/deleteAll')) //用户要求删除所有地址
app.use('/account/showAll', require('./routers/account/showAll')) //用户要求看自己用过的地址


//拍卖商品相关
app.use('/product/getProducts', require('./routers/product/getProducts')) //用户请求一类产品时
    //暂时废弃，改从区块链拿具体商品的信息
    // app.use('/product/getOneProduct', require('./routers/account/getOneProduct')) //用户请求一个产品的具体信息时

//购物相关
app.use('/product/getGoods', require('./routers/goods/getGoods')) //用户请求一类产品时

//拍卖商品相关
app.use('/statistics/getStatistics', require('./routers/statistics/getStatistics')) //用户请求一类产品时


let server = app.listen(5000, (err) => {
    if (!err) {
        console.log('express开启成功');
        console.log("Server run at http://localhost:5000");
    }
    // initMqttServer();

    //监听器
    newProductEventListener();
    changeProductEventListener();
    newGoodsEventListener();
    buyGoodsEventListener();
    newBidEventListener();
    createEscrowEventListener();
    arbiterEarnEventListener();
    disburseAmountEventListener();
})
server.setTimeout(0);