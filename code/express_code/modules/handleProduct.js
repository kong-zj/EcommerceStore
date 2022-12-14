//使用 EcommerceStore.deployed().then(i => { 在回调函数中使用合约实例i
const EcommerceStore = require('./contracts/contract-ecommerceStore');
//包装好的 Product mongodb数据库对象，直接使用
const ProductModel = require('./db/mongo-product');
console.log("进入 modules/handleDevice.js");

const productData = {


    getOneProduct: (param, res) => {

    },


    //得到一类商品信息
    getProducts: (req, res) => {
        console.log("调用 productData 的 getProducts 方法");

        let currentTime = Math.round(new Date() / 1000);
        //enum ProductStatus { Open, Sold, Unsold }
        //注意这里的query与req.query不同，query是传入数据库的查询条件
        // let query = { productStatus: 0 };
        //{ $er: 0 }是更通用的写法，给mongo的find用


        //如果下一行不注释掉，这里可能有问题  非Open状态的看不到了
        // let query = { productStatus: { $eq: 0 } }; //Open
        let query = {};

        //判断req里的filter带的productProcess
        //req.query包含在路由中每个查询字符串参数属性的对象，如果没有则为{}
        //Object.keys() 方法会返回一个由一个给定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致


        // //旧
        // if (Object.keys(req.query).length == 0) {
        //     //"product-list"还在竞拍状态下的商品
        //     //直接给query这个JSON对象加键值对，键值对之间的逗号表示‘与’
        //     query['auctionEndTime'] = { $gt: currentTime };
        // } else if (req.query.productProcess != undefined) {
        //     if (req.query.productProcess == 'reveal') {
        //         //"product-reveal-list"
        //         //300控制reveal的持续时间
        //         query['auctionEndTime'] = { $gt: currentTime - (300), $lt: currentTime };
        //     } else if (req.query.productProcess == 'finalize') {
        //         //"product-finalize-list"
        //         query['auctionEndTime'] = { $lt: currentTime - (300) };
        //     }
        // }


        //后期可以加入更多判断条件
        //新
        //如果参数为空
        if (Object.keys(req.query).length == 0) {
            //不另加限制条件
        } else if (req.query.productProcess != undefined) {
            //如果有productProcess这项数据

            if (req.query.productProcess == 'sell') {
                //正在售卖
                query['auctionEndTime'] = { $gt: currentTime };

            } else if (req.query.productProcess == 'reveal') {
                //正在揭示报价
                //揭示报价的时间段长度，product里存了这个时间数据，怎么使用
                //用 $where 关键字

                // query['auctionEndTime'] = { $lt: currentTime };
                //在mongoDB中的当前时间为 new Date().valueOf()/1000，以秒为单位
                query = { $where: "this.auctionEndTime < new Date().valueOf()/1000 && this.auctionEndTime + this.auctionRevealTime*60 > new Date().valueOf()/1000" };

            } else if (req.query.productProcess == 'finalize') {
                //已经揭示报价
                //用法同上一个if
                query = { $where: "this.auctionEndTime + this.auctionRevealTime*60 < new Date().valueOf()/1000" };
            }
        }

        //query可以写成JSON的形式，也可以用where关键字
        console.log("即将查询数据库，查询条件: ");
        //productStatus : Open (被我注释掉了)
        //auctionEndTime : 各种比较 (部分换成了where关键字)
        console.dir(query);

        //查数据库
        ProductModel.find(query, null, { sort: 'auctionEndTime' }, (err, items) => {
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