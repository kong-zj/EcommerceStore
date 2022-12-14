var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// 引入mongodb连接配置
const mongodbConfig = require('../../config/mongodb');

const connectURL = "mongodb://" + mongodbConfig.host + ":" + mongodbConfig.port + "/" + mongodbConfig.database;

//mongodb的链接
mongoose.connect(connectURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;