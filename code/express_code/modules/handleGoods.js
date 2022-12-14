//使用 EcommerceStore.deployed().then(i => { 在回调函数中使用合约实例i
const EcommerceStore = require('./contracts/contract-ecommerceStore');
//包装好的 Goods mongodb数据库对象，直接使用
const GoodsModel = require('./db/mongo-goods');
console.log("进入 modules/handleDevice.js");

const productData = {



    //得到一类商品信息
    getGoods: (req, res) => {
        console.log("调用 productData 的 getGoods 方法");
        //enum ProductStatus { open, sold}
        //注意这里的query与req.query不同，query是传入数据库的查询条件

        let query = {};

        //判断req里的filter带的goodsProcess
        //req.query包含在路由中每个查询字符串参数属性的对象，如果没有则为{}
        //Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致

        //如果参数为空
        if (Object.keys(req.query).length == 0) {
            //不另加限制条件
            console.log("查询没有限制条件");
        } else if (req.query.goodsProcess != undefined) {
            //如果有goodsProcess这项数据
            console.log("限制条件 : " + req.query.goodsProcess);
            if (req.query.goodsProcess == 'open') {
                //正在售卖
                query['productStatus'] = 0;

            } else if (req.query.goodsProcess == 'sold') {
                //售空
                query['productStatus'] = 1;
            }
        }

        //query可以写成JSON的形式，也可以用where关键字

        console.log("即将查询数据库，查询条件: ");
        console.dir(query);

        //查数据库
        GoodsModel.find(query, null, { sort: 'shippingTime' }, (err, items) => {
            if (err) {
                console.log(err);
            } else {
                console.log("查找到" + items.length + "个数据");
                //发给前端
                res.send(items);
            }
        });

    },



};
module.exports = productData;