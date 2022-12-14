const Shopping = require('../modules/contracts/contract-shopping');
//直接使用
const GoodsModel = require('../modules/db/mongo-goods');

function BuyGoodsEventListener() {

    console.log("监听器 BuyGoodsEventListener 成功开启");

    Shopping.deployed().then(i => {
        console.log("监听器 BuyGoodsEventListener 中的 Shopping合约已deployed().");
        //使用node.js的event的方法
        //事件
        //fromBlock：读取从该编号开始的区块中的事件
        let goodsEvent = i.BuyGoods({ fromBlock: 0, toBlock: 'latest' }, (error, result) => {
            console.log("监听到 BuyGoods 事件，立即处理");
            if (error) {
                console.log("监听 BuyGoods 的回调函数出错 : " + error);
                return;
            }
            buyGoods(result.args);
        });

    });

}

//从区块链保存到mongodb
function buyGoods(goods) {
    console.log("进入监听器 BuyGoodsEventListener 的附属函数 savegoods");
    //findOne是查出第一条，如果能找到就不存了
    //goods._goodsId是uint类型，GoodsModel中的blockchainId是Number类型，为了避免转化出问题，转成String
    GoodsModel.findOne({ 'blockchainId': goods._goodsId.toLocaleString() }, (err, dbProject) => {
        if (err) {
            console.log("在 mongoDB 中用 ID 查询 Goods 出错 : " + err);
            return;
        }
        //1、没有这个ID的 Goods
        if (dbProject == null) {
            console.log("Goods (id = " + goods._goodsId + ") 数据不存在");
            return;
        }

        //如果库存 goods._lastInStockNum 为0，还要改状态
        if (goods._lastInStockNum == 0) {
            GoodsModel.findOneAndUpdate({
                    'blockchainId': goods._goodsId.toLocaleString(),
                }, {
                    $set: {
                        productStatus: 1,
                    }
                },
                (err, dbProject) => {
                    if (err) {
                        console.log("在 mongoDB 中更新 Goods的状态 出错 : " + err);
                        return;
                    }

                    //成功更新
                    console.log("已成功更新Goods为 (id = " + goods._goodsId.toLocaleString() + " , 状态 = 售空 )");
                });

        }


        //一定存在
        GoodsModel.findOneAndUpdate({
                'blockchainId': goods._goodsId.toLocaleString(),
            }, {
                $set: {
                    inStockNum: goods._lastInStockNum.toLocaleString(),
                }
            },
            (err, dbProject) => {
                if (err) {
                    console.log("在 mongoDB 中更新 Goods的库存 出错 : " + err);
                    return;
                }

                //成功更新
                console.log("已成功更新Goods为 (id = " + goods._goodsId.toLocaleString() + " , 库存 = " + goods._lastInStockNum.toLocaleString() + " )");
            });

    });



}


module.exports = BuyGoodsEventListener;