import React, {Component} from 'react';
import cookie from 'react-cookies'
import {Descriptions, message, Spin, Table, Tag} from "antd";
import renderGoods from '../../../utils/renderGoods';

//商品列表组件，需要传数据进去
import GoodsList from '../../../components/GoodsList';

//从IPFS读取
import ipfsReadUrlBefore from '../../../config/ipfsReadUrl';
import ipfsAddAndCatConfig from '../../../config/ipfsAddAndCat';
import ipfsAPI from 'ipfs-api';

//不需要接入合约

//价格格式化
import handlePrice from '../../../utils/handlePrice';
//地址解析
import handleAddress from '../../../utils/handleAddress';

//ipfs实例
const ipfs = ipfsAPI({ host: ipfsAddAndCatConfig.host, port: ipfsAddAndCatConfig.port, protocol: ipfsAddAndCatConfig.protocol });

//从数据库拿商品信息
class Shopping extends Component {

    // state = {
        // productInSell: [],
        // productInReveal: [],
        // productInFinalize: []
    // }

    constructor (props) {
        super(props);
    }


    //注意同步，不然还没得到结果，就把null返回了
    getGoodsList = async(process) => {
        //process 可能的值为
        //"open"
        //"sold"
        console.log("getGoodsList 的参数为 : " + process);
        

        //New，从后台的mongoDB拿数据
        let productInProcess = await renderGoods({ goodsProcess: process });
        console.log("getGoodsList, process = " + process + " 请求到的数据为 : ");
        console.dir(productInProcess.data);

        //从数据库里拿到的信息是这样的 productArray[0]
        //结构为
        // _id: ObjectId("62449a3b32aff27585ce7b15"),
        // name: '商品名称2111',
        // category: '艺术品,画作',
        // ipfsImageHashArray: [ 'QmcSe6Vt9SfvXuz1gFbtb8gnvYmL4bp4oYVdTtzyFHvVnH' ],
        // ipfsDescHash: 'QmewtY21Ufyqa166AWXrSC3Y3FMqKMhpRRPH2tqTNMUALE',
        // price: 1000000000000000000,
        // shippingTime: 3,
        // productStatus: 0,
        // inStockNum: 111,
        // originPlace: [ 1, 72 ],
        // __v: 0


        //要传给 GoodsList 用来显示的信息是这样的
        //blockchainId (int)
        //name (String)
        //category (String)
        //ipfsDescHash (String)
        //ipfsImageHashArray (String数组)
        //price (String) 大于1ETH 用 ETH 做单位，小于时用 wei
        //productStatus (int) 是否售空
        //shippingTime (int) 发货时效，单位是天
        //inStockNum (int) 库存
        //productAddress (string) 发货地

        // let arrayLength = productInProcess.data.length;

        
        let array = await productInProcess.data.map(async (item, index) => {
            //item 是数组的大元素

            //价格使用合适单位
            // priceString 是字符串
            let priceString = handlePrice(item.price);

            //注意异步的执行先后顺序问题
            // 将商品介绍从 ipfs 下载，存为descString
            let descString = "商品介绍占位";
            await ipfs.cat(item.ipfsDescHash).then(file => {
                descString = file.toString();
            })

            //把发货地址的 [int,int] 解析成 string
            let addressString = handleAddress(item.originPlace);
            console.log("地址解析为 : ");
            console.dir(addressString);

            //只要第一张图片
            let ipfsFirstImageHash = item.ipfsImageHashArray[0];
                    
            return {
                //key从1开始
                key: index + 1,
                blockchainId : item.blockchainId, //用于用户点击时，用区块链中的ID查询商品详细信息
                name : item.name,
                category : item.category,
                //过长就截断
                descString : (descString.length > 150) ? descString.slice(0,150)+"......"  : descString,
                imageUrl : ipfsReadUrlBefore + ipfsFirstImageHash,
                inStockNum : item.inStockNum,
                price : priceString,
                addressString : addressString,
                shippingTime : item.shippingTime,
            }
        });

        console.log("格式化后, 即将传入 GoodsList 的数据为 : ");
        console.log(array);

        return array;
    }

    //注意同步，不然还没得到结果，就把null返回了
    componentDidMount  = () => {
        console.log("生成Shopping模块");
    }



    
    render () {

        return (

            <div>
                <Descriptions
                    title="正在出售"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                />
                <GoodsList productArray={this.getGoodsList("open")}></GoodsList>

                <Descriptions
                    title="已售空"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'50px'}}
                />
                <GoodsList productArray={this.getGoodsList("sold")}></GoodsList>

            </div>
        );
    }
}

export default Shopping;
