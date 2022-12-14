const express = require('express');
const router = express.Router();
const goods = require('../../../modules/handleGoods');


//注意区分 req.params, req.query, req.body

//这个 body-parser 貌似是给 post 请求用的，get 请求不能用它解析
// const bodyParser = require("body-parser");
// const jsonParser = bodyParser.json();

//看清 get 和 post
// router.post('/', jsonParser, function(req, res, next) {
router.get('/', function(req, res, next) {
    goods.getGoods(req, res);
});
console.log("in routers/getGoods");
module.exports = router