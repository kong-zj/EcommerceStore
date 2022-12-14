const express = require('express');
const router = express.Router();
const product = require('../../../modules/handleProduct');


//注意区分 req.params, req.query, req.body

//这个 body-parser 貌似是给 post 请求用的，get 请求不能用它解析
// const bodyParser = require("body-parser");
// const jsonParser = bodyParser.json();

//看清 get 和 post
// router.post('/', jsonParser, function(req, res, next) {
router.get('/', function(req, res, next) {

    //这里蠢了, req.body 不需要.body, 传过去req, 让函数内部处理
    // product.getProducts(req.body, res);
    product.getProducts(req, res);
});
console.log("in routers/getProducts");
module.exports = router