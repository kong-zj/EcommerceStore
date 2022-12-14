const express = require('express');
const router = express.Router();
const account = require('../../../modules/handleAccount');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
router.post('/', jsonParser, function(req, res, next) {
    console.log("路由转发 ./routers/account/insertOrUpdate");
    account.insertOrUpdate(req.body, res);
});

module.exports = router