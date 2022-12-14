var mongoose = require('./connect-mongo');

//低版本的 mongoose 使用，It does nothing in Mongoose 5
// mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

//数据模型
var ProductSchema = new Schema({
    blockchainId: Number,
    seller: String,
    name: String,
    category: String,
    //注意这里数组的写法
    ipfsImageHashArray: [String],
    ipfsDescHash: String,
    auctionStartTime: Number,
    auctionEndTime: Number,
    price: Number,
    condition: Number,
    productStatus: Number,
    auctionRevealTime: Number,
});

var ProductModel = mongoose.model('ProductModel', ProductSchema);

//在node中引出文件的写法
module.exports = ProductModel;