import React, {Component} from 'react';
import cookie from 'react-cookies'
import {Descriptions, message, Spin, Table, Tag} from "antd";
import renderProducts from '../../../utils/renderProducts';

//商品列表组件，需要传数据进去
import ProductList from '../../../components/ProductList';

//从IPFS读取
import ipfsReadUrlBefore from '../../../config/ipfsReadUrl';
import ipfsAddAndCatConfig from '../../../config/ipfsAddAndCat';
import ipfsAPI from 'ipfs-api';

//不需要接入合约

//价格格式化
import handlePrice from '../../../utils/handlePrice';
//时间格式化
import handleTimeString from '../../../utils/handleTimeString';

//ipfs实例
const ipfs = ipfsAPI({ host: ipfsAddAndCatConfig.host, port: ipfsAddAndCatConfig.port, protocol: ipfsAddAndCatConfig.protocol });

//从数据库拿商品信息
class AuctionInto extends Component {

    // state = {
        // productInSell: [],
        // productInReveal: [],
        // productInFinalize: []
    // }

    constructor (props) {
        super(props);
    }


    //注意同步，不然还没得到结果，就把null返回了
    getProductList = async(process) => {
        //process 可能的值为
        //"sell"
        //"reveal"
        //"finalize"
        

        //New，从后台的mongoDB拿数据
        let productInProcess = await renderProducts({ productProcess: process });
        console.log("getProductList, process = " + process + " 请求到的数据为 : ");
        console.dir(productInProcess.data);

        //从数据库里拿到的信息是这样的 productArray[0]
        //结构为
        // auctionEndTime: 1646381747
        // auctionStartTime: 1646381347
        // blockchainId: 1
        // category: "Cell Phones & Accessories"
        // condition: 0 (全新还是二手)
        // ipfsDescHash: "QmRa3BnvMUU6DxnLzxymAd7dweyWAYLzW3R99KkGCJAgRn"
        // ipfsImageHashArray: 字符串数组
        // name: "iphone 5"
        // price: 2000000000000000000
        // productStatus: 0 (卖没卖出去)
        // __v: 0
        // _id: "6221c928b1126364e456764e"


        //要传给 ProductList 用来显示的信息是这样的
        //blockchainId (int)
        //name (String)
        //category (String)
        //ipfsDescHash (String)
        //ipfsImageHashArray (String数组)
        //processTime (String) 已结束 或者 距离结束的时间
        //price (String) 大于1ETH 用 ETH 做单位，小于时用 wei
        //productCondition (String) 新旧

        // let arrayLength = productInProcess.data.length;

        
        let array = await productInProcess.data.map(async (item, index) => {
            //item 是数组的大元素

            //价格使用合适单位
            let priceString = handlePrice(item.price);

            //计算 processTime, 与最外层函数的参数 process 有关
            let processTimeString = handleTimeString(item.auctionEndTime, process);

            //注意异步的执行先后顺序问题
            // 将商品介绍从 ipfs 下载，存为descString
            let descString = "商品介绍占位";
            await ipfs.cat(item.ipfsDescHash).then(file => {
                descString = file.toString();
            })

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
                productCondition : (item.condition === 0) ? "全新" : "二手",
                price : priceString,
                processTime : processTimeString
            }
        });

        console.log("格式化后, 即将传入 ProductList 的数据为 : ");
        console.log(array);

        return array;
    }

    //注意同步，不然还没得到结果，就把null返回了
    componentDidMount  = () => {
        console.log("生成AuctionInto模块");

        // //注意，不能这样更新，错误写法
        // this.state.productInSell = await this.getProductList("sell");
        // this.state.productInReveal = await this.getProductList("reveal");
        // this.state.productInFinalize = await this.getProductList("finalize");

        // let productInSell =  this.getProductList("sell");
        // let productInReveal =  this.getProductList("reveal");
        // let productInFinalize =  this.getProductList("finalize");

        // //学习 PersonalInfo 的处理方式
        // //这里是异步的，在下面的 render 中调用，显示为 null
        // this.setState({
        //     productInSell : productInSell,
        //     productInReveal : productInReveal,
        //     productInFinalize : productInFinalize
        // }, () =>{
        //     console.log("this.setState 执行完毕");
        // }
        // )




        // axios.post("/account/showAll", {
        //     username:this.state.username
        // }).then(response => {
        //     const data =  response.data;
        //     if(data.status === "success"){
        //         console.log("获取该用户所有曾用地址成功");
        //         //data.accountAndLastTime 是外层是数组，每个数组元素是字典类型
        //         //map 方法，数组映射
                // let array = data.accountAndLastTime.map((item, index) => {
                //     //计算时间差，判断是否活跃
                //     //注意mysql返回的 timestamp 与js中的 Date 的区别，以及相互转换
                //     let timeDifference = new Date() - new Date(item.lastTime);
                //     console.log("这个日期距离现在已经 " + timeDuration(timeDifference));
                //     //小于一天时间的是活跃账户
                //     let tag = ( timeDifference> 24*60*60*1000) ? true : false;
                //     return {
                //         //key从1开始
                //         key: index + 1,
                //         accountString: item.accountString,
                //         accountStatus: tag ? 0:1,
                //         //moment库，格式化时间
                //         lastTime: moment(item.lastTime).format('yy年M月D日, h:mm:ss a')
                //     }
                // });
        //         console.log("map映射后的要放到列表中的数据 array 为 : ");
        //         console.dir(array);
        //         this.setState({accountAndLastTimeArray:array});

        //     }
        //     else{
        //         console.log("获取该用户所有曾用地址出错");
        //         message.warning ("获取地址信息出错").then (r  => console.log(r));
        //     }
        // }).catch( err => {
        //     console.log("发起获取所有曾用地址的请求失败, ERR : " + err);
        // });
    }





    
    render () {
        // const {productInSell,
        //     productInReveal,
        //     productInFinalize} = this.state;


        return (

            <div>
                <Descriptions
                    title="出示报价"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                />
                <ProductList productArray={this.getProductList("sell")}></ProductList>

                <Descriptions
                    title="揭示报价"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'50px'}}
                />
                <ProductList productArray={this.getProductList("reveal")}></ProductList>

                <Descriptions
                    title="结束拍卖"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'50px'}}
                />
                <ProductList productArray={this.getProductList("finalize")}></ProductList>

            </div>
        );
    }
}

export default AuctionInto;
