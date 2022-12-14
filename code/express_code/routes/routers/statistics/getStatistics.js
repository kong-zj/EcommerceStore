const express = require('express');
const router = express.Router();
const statistics = require('../../../modules/handleStatistics');


//注意区分 req.params, req.query, req.body

//这个 body-parser 貌似是给 post 请求用的，get 请求不能用它解析
// const bodyParser = require("body-parser");
// const jsonParser = bodyParser.json();

//看清 get 和 post
// router.post('/', jsonParser, function(req, res, next) {
router.get('/', function(req, res, next) {
    // escrow_through, success_precent, product_all_num, product_user_num, bid_user_num, buy_user_num, sell_earn, arbit_earn
    console.log("Object.keys(req.query).length ==== " + Object.keys(req.query).length);

    if (Object.keys(req.query).length != 2) {
        //出错
        res.send("------------------[ERROR]");
    } else if (req.query.process != undefined && req.query.userName != null) {
        //如果有process这项数据
        //正常
        //拆分
        if (req.query.process == 'escrow_through') {
            statistics.getEscrowThrough(req.query.userName, res);
        } else if (req.query.process == 'success_precent') {
            statistics.getSuccessPrecent(req.query.userName, res);
        } else if (req.query.process == 'product_all_num') {
            statistics.getProductAllNum(req.query.userName, res);
        } else if (req.query.process == 'product_user_num') {
            statistics.getProductUserNum(req.query.userName, res);
        } else if (req.query.process == 'bid_user_num') {
            statistics.getBidUserNum(req.query.userName, res);
        } else if (req.query.process == 'buy_user_num') {
            statistics.getBuyUserNum(req.query.userName, res);
        } else if (req.query.process == 'sell_earn') {
            statistics.getSellEarn(req.query.userName, res);
        } else if (req.query.process == 'arbit_earn') {
            statistics.getArbitEarn(req.query.userName, res);
        }
    } else {
        res.send("-------------------[ERROR]");
    }
});
console.log("----------------------in routers/getStatistics");
module.exports = router