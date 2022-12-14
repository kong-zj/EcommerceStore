const express = require('express');
const router = express.Router();
const product = require('../../../modules/handleProduct');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
router.post('/', jsonParser, function(req, res, next) {
    product.getOneProduct(req.body, res);
});

console.log("in routers/getOneProduct");
module.exports = router


//暂时废弃，改从区块链中提取具体 product 的信息