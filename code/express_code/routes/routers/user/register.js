const express = require('express');
const router = express.Router();
const user = require('../../../modules/handleUser');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
router.post('/', jsonParser, function(req, res, next) {
    console.log("路由转发 ./routers/user/register");
    user.register(req.body, res);
});

module.exports = router