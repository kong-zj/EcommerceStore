const EcommerceStore = require('../modules/contracts/contract-ecommerceStore');
//直接使用
const ProductModel = require('../modules/db/mongo-product');

function newProductEventListener() {

    console.log("监听器 newProductEventListener 成功开启");

    EcommerceStore.deployed().then(i => {
        console.log("监听器 newProductEventListener 中的 EcommerceStore合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let productEvent = i.NewProduct({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 NewProduct 事件，立即处理");
            if (error) {
                console.log("监听 NewProduct 的回调函数出错 : " + error);
                return;
            }
            saveProduct(result.args);
        });
        // console.log("监听器 newProductEventListener 打印 productEvent 对象:");
        // console.dir(productEvent);
    });

    // //这种写法太老了，新版本中报错
    // EcommerceStore.deployed().then(i => {
    //     //事件
    //     //fromBlock：读取从该编号开始的区块中的事件
    //     let productEvent = i.NewProduct({ fromBlock: 0, toBlock: 'latest' });
    //     console.log("打印productEvent对象:");
    //     console.dir(productEvent);
    //     //报错 TypeError: productEvent.watch is not a function
    //     productEvent.watch((error, result) => {
    //         if (error) {
    //             console.log(error);
    //             return;
    //         }
    //         saveProduct(result.args);
    //     });
    // });

    // //这里蠢了，使用的是truffle-contract的方式来对合约进行调用，仍然想用web3.js的方式进行事件的监听
    // //报错 TypeError: EcommerceStore.events.NewProduct is not a function
    // EcommerceStore.events.NewProduct({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
    //     if (error) {
    //         console.log(error);
    //         return;
    //     }
    //     saveProduct(result.args);
    // });

}

//从区块链保存到mongodb
function saveProduct(product) {
    console.log("进入监听器 newProductEventListener 的附属函数 saveProduct");
    //ProductModel是mongodb中的collection
    //findOne是查出第一条，如果能找到就不存了
    //product._productId是uint类型，ProductModel中的blockchainId是Number类型，为了避免转化出问题，转成String
    ProductModel.findOne({
        'blockchainId': product._productId.toLocaleString(),
        'seller': product._seller.toLocaleString()
    }, (err, dbProject) => {
        if (err) {
            console.log("在 mongoDB 中搜索是否有重复的 Product 出错 : " + err);
            return;
        }
        //数据已经存在mongodb
        if (dbProject != null) {
            console.log("Product (id = " + dbProject.blockchainId + " , name = " + dbProject.name + " , seller = " + dbProject.seller + ")数据已经存在于 mongoDB ，不再重复存储");
            return;
        }

        var p = new ProductModel({
            blockchainId: product._productId,
            seller: product._seller.toLocaleString(),
            name: product._name,
            category: product._category,
            //单个图片升级为多张图片
            ipfsImageHashArray: product._imageLinkArray,
            ipfsDescHash: product._descLink,
            auctionStartTime: product._auctionStartTime,
            auctionEndTime: product._auctionEndTime,
            price: product._startPrice,
            //_productCondition没有做枚举类型转换
            condition: product._productCondition,
            //Open状态
            productStatus: 0,
            auctionRevealTime: product._auctionRevealTime,
        });


        p.save(err => {
            if (err) {
                console.log("在 mongoDB 中保存 Product 出错 : " + err);
            } else {
                ProductModel.count({}, function(err, count) {
                    if (err) {
                        console.log("在 mongoDB 中查询 Product 总数时出错 : " + err);
                    }
                    console.log("mongoDB中的 Product 总数为 : " + count);
                })
            }
        })
    });
}

module.exports = newProductEventListener;