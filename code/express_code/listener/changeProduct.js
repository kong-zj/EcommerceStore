const EcommerceStore = require('../modules/contracts/contract-ecommerceStore');
//直接使用
const ProductModel = require('../modules/db/mongo-product');

function changeProductEventListener() {

    console.log("监听器 changeProductEventListener 成功开启");

    EcommerceStore.deployed().then(i => {
        console.log("监听器 changeProductEventListener 中的 EcommerceStore合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let productEvent = i.ChangeProduct({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 ChangeProduct 事件，立即处理");
            if (error) {
                console.log("监听 ChangeProduct 的回调函数出错 : " + error);
                return;
            }
            changeProduct(result.args);
        });
        // console.log("监听器 changeProductEventListener 打印 productEvent 对象:");
        // console.dir(productEvent);
    });

}

//从区块链保存到mongodb
function changeProduct(product) {
    // product 的子元素
    // uint _productId, address _seller, uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition, uint _auctionRevealTime  
    console.log("进入监听器 changeProductEventListener 的附属函数 changeProduct");

    //修改原来的 Product 信息
    //ProductModel是mongodb中的collection
    //product._productId是uint类型，ProductModel中的blockchainId是Number类型，为了避免转化出问题，转成String

    ProductModel.findOne({
        'blockchainId': product._productId.toLocaleString(),
        'seller': product._seller.toLocaleString()
    }, (err, dbProject) => {
        if (err) {
            console.log("在 mongoDB 中用 ID 和 seller 查询 Product 出错 : " + err);
            return;
        }

        // //数据不可能已经存在mongodb
        // if (dbProject != null) {
        //     console.log("Product (id = " + dbProject.blockchainId + " , name = " + dbProject.name + " , seller = " + dbProject.seller + ")数据已经存在于 mongoDB ，不再重复存储");
        //     return;
        // }

        //数据不存在 1、没有这个ID的 Product(这是异常情况)， 2、有这个ID的 Product 但是seller没有更改， 3、有这个ID的 Product 同时seller保持不变
        ProductModel.findOne({
            'blockchainId': product._productId.toLocaleString(),
        }, (err, dbProject) => {
            if (err) {
                console.log("在 mongoDB 中用 ID 查询 Product 出错 : " + err);
                return;
            }
            //1、没有这个ID的 Product
            if (dbProject == null) {
                console.log("Product (id = " + product._productId + ") 数据不存在");
                return;
            }
            //2、有这个ID的 Product 但是seller没有更改
            //或者
            //3、有这个ID的 Product 同时seller保持不变
            ProductModel.findOneAndUpdate({
                    'blockchainId': product._productId.toLocaleString(),
                }, {
                    $set: {
                        seller: product._seller.toLocaleString(),
                        auctionStartTime: product._auctionStartTime,
                        auctionEndTime: product._auctionEndTime,
                        price: product._startPrice,
                        //_productCondition没有做枚举类型转换
                        condition: product._productCondition,
                        //Open状态
                        productStatus: 0,
                        auctionRevealTime: product._auctionRevealTime,
                    }
                },
                (err, dbProject) => {
                    if (err) {
                        console.log("在 mongoDB 中更新 Product 出错 : " + err);
                        return;
                    }
                    //要更新的 Product 不存在
                    if (dbProject == null) {
                        console.log("Product (id = " + product._productId + ") 数据不存在");
                        return;
                    }

                    //成功更新
                    console.log("已成功更新为 (id = " + product._productId.toLocaleString() + " , seller = " + product._seller.toLocaleString() + " )");
                });

        });


    });

}

module.exports = changeProductEventListener;