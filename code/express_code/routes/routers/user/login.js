const express = require('express');
const router = express.Router();
const user = require('../../../modules/handleUser');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

//由app.use('/login', require('./routers/user/login'))转发而来
//注意这时候再加路由，就可以不带前面的/login路径了
router.post('/', jsonParser, function(req, res, next) {
    console.log("路由转发 ./routers/user/login");
    user.login(req.body, res);
});

module.exports = router