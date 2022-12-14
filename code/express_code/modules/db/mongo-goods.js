var mongoose = require('./connect-mongo');

//低版本的 mongoose 使用，It does nothing in Mongoose 5
// mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

//数据模型
var GoodsSchema = new Schema({
    blockchainId: Number,
    name: String,
    category: String,
    //注意这里数组的写法
    ipfsImageHashArray: [String],
    ipfsDescHash: String,
    price: Number,
    //发货时效
    shippingTime: Number,
    //是否有货
    productStatus: Number,
    //库存
    inStockNum: Number,
    //发货地
    originPlace: [Number],

});

var GoodsModel = mongoose.model('GoodsModel', GoodsSchema);

//在node中引入文件的写法
module.exports = GoodsModel;