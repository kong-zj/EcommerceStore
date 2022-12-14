const Shopping = require('../modules/contracts/contract-shopping');
//直接使用
const GoodsModel = require('../modules/db/mongo-goods');

function NewGoodsEventListener() {

    console.log("监听器 NewGoodsEventListener 成功开启");

    Shopping.deployed().then(i => {
        console.log("监听器 NewGoodsEventListener 中的 Shopping合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let goodsEvent = i.NewGoods({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 NewGoods 事件，立即处理");
            if (error) {
                console.log("监听 NewGoods 的回调函数出错 : " + error);
                return;
            }
            saveGoods(result.args);
        });

    });

}

//从区块链保存到mongodb
function saveGoods(goods) {
    console.log("进入监听器 NewGoodsEventListener 的附属函数 savegoods");
    //findOne是查出第一条，如果能找到就不存了
    //goods._goodsId是uint类型，GoodsModel中的blockchainId是Number类型，为了避免转化出问题，转成String
    GoodsModel.findOne({ 'blockchainId': goods._goodsId.toLocaleString() }, (err, dbProject) => {
        if (err) {
            console.log("在 mongoDB 中搜索是否有重复的 Goods 出错 : " + err);
            return;
        }
        //数据已经存在mongodb
        if (dbProject != null) {
            console.log("Goods (id = " + dbProject.blockchainId + " , name = " + dbProject.name + ")数据已经存在于 mongoDB ，不再重复存储");
            return;
        }

        var p = new GoodsModel({
            blockchainId: goods._goodsId,
            name: goods._name,
            category: goods._category,
            //单个图片升级为多张图片
            ipfsImageHashArray: goods._imageLinkArray,
            ipfsDescHash: goods._descLink,
            //发货时效
            shippingTime: goods._shippingTime,
            //库存
            inStockNum: goods._inStockNum,
            //价格
            price: goods._price,
            //发货地
            originPlace: goods._originPlace,
            //默认有货
            productStatus: 0,
        });



        p.save(err => {
            if (err) {
                console.log("在 mongoDB 中保存 goods 出错 : " + err);
            } else {
                GoodsModel.count({}, function(err, count) {
                    if (err) {
                        console.log("在 mongoDB 中查询 goods 总数时出错 : " + err);
                    }
                    console.log("mongoDB中的 goods 总数为 : " + count);
                })
            }
        })
    });
}

module.exports = NewGoodsEventListener;