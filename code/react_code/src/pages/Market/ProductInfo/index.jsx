import React, {Component} from 'react';
import cookie from 'react-cookies';
import ipfsAPI from 'ipfs-api';
// import EditDeviceModal from "../../EditDeviceModal";
import { message, Card, Carousel, Drawer, Tag, Progress, Timeline} from 'antd';
import {
    Form,
    Input,
    InputNumber,
    Cascader,
    Select,
    Row,
    Col,
    Checkbox,
    Button,
    Upload,
    AutoComplete,
    DatePicker,
    Slider,
    Image
  } from 'antd';
import { Typography, Divider } from 'antd';
// import axios from "axios";
// import cookie from "react-cookies";

import 'antd/dist/antd.css';
// import './index.css';
import { List, Avatar, Space} from 'antd';

//竞拍模块
import Bid from '../../../components/Auction/Bid';
//揭示报价模块
import Reveal from '../../../components/Auction/Reveal';
//成为仲裁者模块
import Finalize from '../../../components/Auction/Finalize';
//释放资金模块
import ReleaseFunds from '../../../components/Auction/ReleaseFunds';
//退还资金模块
import RefundFunds from '../../../components/Auction/RefundFunds';
//最高竞价人信息模块
import HighestBidderInfo from '../../../components/Auction/HighestBidderInfo';
//最终资金流向信息模块
import EscrowInfo from '../../../components/Auction/EscrowInfo';
//转卖模块
import Resell from '../../../components/Auction/Resell';

//溯源信息展示模块
import Tracing from '../../../components/Tracing'; 

//接入合约
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import getTracing from '../../../utils/getTracing';

//从IPFS读取
import ipfsReadUrlBefore from '../../../config/ipfsReadUrl';
import ipfsAddAndCatConfig from '../../../config/ipfsAddAndCat';

//价格格式化
import handlePrice from '../../../utils/handlePrice';
//时间格式化
import handleTimeString from '../../../utils/handleTimeString';

import Meta from 'antd/lib/card/Meta';
import Countdown from 'antd/lib/statistic/Countdown';
import moment from 'moment';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, SyncOutlined } from '@ant-design/icons';


const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );

//ipfs实例
const ipfs = ipfsAPI({ host: ipfsAddAndCatConfig.host, port: ipfsAddAndCatConfig.port, protocol: ipfsAddAndCatConfig.protocol });


//从区块链读出某件商品信息
class ProductInfo extends Component {

    state = {
        web3 : null,
        truffleContract : null,
        tracingContract : null,
        dataArray : [],
        startTimeVisible : false,
        //竞拍按钮
        bidVisible : false,
        //揭示报价按钮
        revealVisible : false,
        //申请成为仲裁人按钮
        finalizeVisible : false,
        //最高出价人信息
        highestBidderInfoVisible : false,
        //放款按钮和退款按钮
        releaseAndRefundFundsVisible: false,
        //最终资金流向信息
        escrowInfoVisible : false,
        //转卖按钮
        resellVisible : false,
        //未成交进入转卖阶段
        resellProcess : false,
        //直接在子部件 EscrowInfo 中控制,这里废弃
        // //看是否是当前地址，控制一些信息只对相关的人展示
        // seller : null,
        // buyer : null, 
        // arbiter : null,
    }

    constructor (props) {
        super(props);
    }

    getCurrentTimeInSeconds = () => {
        return Math.round(new Date() / 1000);
    }

    //清除cookie
    componentWillUnmount () {
        cookie.remove('searchProductID', { path: '/' });
    }

    getBlockChainInfo = async() => {
        try{
            const web3 = await getWeb3();
            const EcommerceStore = await getEcommerceStore(web3);
            const Tracing = await getTracing(web3);
            this.setState({
                web3: web3,
                truffleContract:EcommerceStore,
                tracingContract:Tracing
            });
            message.success("接入智能合约成功", 2);
            console.log("ProductInfo 的 web3 : ");
            console.dir(web3);
            console.log("ProductInfo 的 EcommerceStore : ");
            console.dir(this.state.truffleContract);
            return true;
        }catch (error) {
            // Catch any errors for any of the above operations.
            alert(
              `[ERROR]接入智能合约失败.`,
            );
            console.error(error);
            return false;
          }
        
    }

    // refresh = () =>{
    //     //刷新
    //     this.componentDidMount();
    // }

    //componentWillMount在render之前运行
    //componentDidMount 在render之后运行
    //注意先后顺序，this.getBlockChainInfo 在前，that.renderProductDetails 在后
    async componentDidMount () {
    // componentWillMount () {
        let that = this;
        console.log("生成ProductInfo模块");
        if(await this.getBlockChainInfo()){
            console.log("获得合约信息成功");

            console.log("componentDidMount 中查询 cookie:searchProductID 为 : " + cookie.load('searchProductID'));
            console.log("componentDidMount 中查询 this.state.dataArray 的长度为 : " + this.state.dataArray.length);
            //利用 cookie，如果 cookie 中有商品ID，但是这个商品未显示，那就将它显示出来
            //有了这个功能，从商品列表跳转到某个商品的详情页，不需要做其他操作
            if(cookie.load('searchProductID') !==undefined && this.state.dataArray.length === 0) {
                console.log("用 cookie 中包含的商品ID信息，加载商品详情页");
                let arg = {};
                arg.ProductID = cookie.load('searchProductID');
                that.renderProductDetails(arg);
            }
        }else{
            console.log("获得合约信息失败");
        }
    }


    //控制显示与隐藏
    //初始状态都为 false
    // //竞拍按钮
    // bidVisible 
    // //揭示报价按钮
    // revealVisible 
    // //申请成为仲裁人按钮
    // finalizeVisible 
    // //最高出价人信息
    // highestBidderInfoVisible 
    // //放款按钮
    // releaseFundsVisible 
    // //退款按钮
    // refundFundsVisible 
    // //最终资金流向信息
    // escrowInfoVisible 
    controlButtonAndInfo = async (p) => {
        //从区块链里拿到的信息是这样的 res为
        // 0: BN {negative: 0, words: Array(2), length: 1, red: null}
        // 1: "1212"
        // 2: "艺术品,画作"
        // 3: "Qma4Cm8m52QogsfMkZ3SE6dD1rrtcRqEs1zJ69BJT6kFoW" //product.imageLink
        // 4: "Qmbc2XnQMmBjCPaXqWvPii1taM6VpvaWaDCGPMEm6y57nm" //product.descLink
        // 5: Array(3)
            // 0: BN 开始时间(秒)
            // 1: BN 结束时间(秒)
            // 2: BN 揭示报价时长(分)
        // 6: BN  //product.startPrice
        // 7: BN  //product.status
        // 8: BN  //product.condition

        let currentTime = this.getCurrentTimeInSeconds();
        let productStatus = parseInt(p[7]);

        //把三个时间从数组 originInfo[5] 中拿出来，都是以秒为单位，别忘了转化为 int
        let auctionStartTime = parseInt(p[5][0]);
        let auctionEndTime = parseInt(p[5][1]);
        let auctionRevealTime = parseInt(p[5][2]) * 60;
        //p[7] = Sold
        if (productStatus == 1) {
            console.log("商品状态为 Sold");
            //显示最高竞价者和资金托管信息
            this.setState({
                highestBidderInfoVisible : true,
                escrowInfoVisible : true
            })
        }
        //p[7] = Unsold
        else if (productStatus == 2) {
            console.log("商品状态为 Unsold");
            //显示没有人出示报价
            this.setState({
                highestBidderInfoVisible : false,
            })

            //当时是否是卖家地址，决定是否显示转卖按钮
            let currentAccount = await this.state.web3.eth.getAccounts();
            this.state.truffleContract.deployed().then( (i) => {
                console.log("进入 this.state.truffleContract.deployed() 的回调函数");
                //异步执行，可能报错
                // let productId = this.state.dataArray[0].ID;
                let productId = parseInt(p[0]);
                try{
                    //获取卖家地址
                    i.sellerInfo(productId).then(res => {
                        console.log("sellerInfo return : ");
                        console.dir(res);
                        //当时是卖家地址
                        if(currentAccount == res){
                            //显示转卖按钮
                            this.showResellButton();
                        }
                        
                    });  
                }catch(err) {
                    message.error("id = " + productId + "的商品的seller信息查询失败",2);
                    console.log("调用合约的sellerInfo方法失败 " + err);
                }
    
                
            });

        }
        //p[7] = Open
        //还未到竞拍时间
        else if (currentTime < auctionStartTime) {
            console.log("商品状态为 Open ，还未到竞拍时间， 当前时间 : " + currentTime + ", 竞拍开始时间 : " + auctionStartTime);
            //显示开始时间
            this.setState({
                startTimeVisible : true,
            })
        }
        //在竞拍时间段内
        else if (currentTime < auctionEndTime) {
            console.log("商品状态为 Open， 在竞拍时间段内, 当前时间 : " + currentTime + ", 竞拍结束时间 : " + auctionEndTime);
            //显示竞拍按钮
            this.setState({
                bidVisible : true,
                startTimeVisible : false,
            })
        }
        //揭示报价阶段内
        //控制reveal的持续时间
        else if (currentTime  < auctionEndTime + auctionRevealTime) {
            console.log("商品状态为 Open， 在揭示报价时间段内， 当前时间 : " + currentTime + ", 揭示报价结束时间 : " + (auctionEndTime + auctionRevealTime));
            //显示揭示报价按钮
            this.setState({
                revealVisible : true,
                startTimeVisible : false,
                bidVisible : false,
            })
        }
        //等待有人申请成为仲裁人
        //有了仲裁人之后，商品会变成 Sold 或者 Unsold 状态 
        else {
            console.log("商品状态为 等待有人成为仲裁人");
            //显示成为仲裁人按钮
            this.setState({
                finalizeVisible : true,
                startTimeVisible : false,
                bidVisible : false,
            })
        }
    }    


    //接收子组件到父组件的反向数据流
    showReleaseAndRefund = () => {
        this.setState({
            releaseAndRefundFundsVisible : true,

        });
    }

    offReleaseAndRefund = () => {
        this.setState({
            releaseAndRefundFundsVisible : false,

        });
    }

    //1、走了一遍拍卖流程后的转卖，2、没人出价，原卖家重新买
    showResellButton = () => {
        this.setState({
            resellVisible : true,

        });
    }

    setResellProcess = () => {
        this.setState({resellProcess : true})
    }

    //点击提交按钮，表单可以提交时
    onFinish = (values) => {
        console.log('onFinish 的 values : ', values);

        let decodedParams = {};
        Object.keys(values).forEach(key => {
            decodedParams[key] = decodeURIComponent(decodeURI(values[key]));
        });
        // console.log('onFinish 的 values 解析为 decodedParams : ', decodedParams);

        //decodedParams 进一步格式化
        //参数全都变成String
        message.info("正在提交查询数据",2);
        try{
            //调用之前就隐藏
            // $("#bidding, #revealing, #finalize-auction, #escrow-info").hide();
            this.renderProductDetails(decodedParams);
        }catch(err){
            console.log("在区块链中查询失败" + err);
            return;
        }
    }


    //点击提交按钮，表单不能提交时
    onFinishFailed = (errorInfo) => {
        message.warning("请正确填写商品ID信息",2);
    }



    //调用区块链方法，得到某个具体的商品信息
    renderProductDetails = (params) => {

        if(this.state.truffleContract === null || this.state.web3 === null){
            message.error("连接合约失败",2);
            console.log("[ERROR]web3 或者 truffleContract 为 null");
            return;
        }

        //传来的数据已格式化为
        //params.ProductID (String)
        let productId = params.ProductID;

        console.log("用来查询的信息 : ");
        console.log("productId : " + productId);

        console.log("合约为 : ");
        console.dir(this.state.truffleContract);
        
    
        //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
        //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
        let that = this;
        this.state.truffleContract.deployed().then( (i) => {
            console.log("进入 this.state.truffleContract.deployed() 的回调函数");
            try{
                i.getProduct(productId).then(async res => {
                    //可能返回为空，要判断是否真的取到了数据，如果不判断，直接调用 formatProductInfo(res)，里面的 ipfs 会报错
                    console.log("getProduct 取到的原始数据为 : ");
                    console.dir(res);
                    //通过 res[1]，也就是产品的name是否为空来判断
                    if(res[1]===""){
                        message.error("该ID没有对应的商品",2);
                        return;
                    }


                    //格式化数据，便于显示
                    let oneProductInfo = await this.formatProductInfo(res);
                    console.log("格式化之后的数据 oneProductInfo 为 ");
                    console.dir(oneProductInfo);

                    this.setState({
                        dataArray : [...this.state.dataArray, oneProductInfo]
                    });

                    //设置cookie，不怕刷新
                    cookie.save('searchProductID', productId, {path:'/'});
                    message.success("商品ID查询成功",2);

                    //根据当前的 res 和 状况，判断显示什么信息
                    this.controlButtonAndInfo(res);
                    
                });  
            }catch(err) {
                message.error("商品ID查询失败",2);
                console.log("调用合约的getProduct方法失败 " + err);
            }

            
        });
    }

    //格式化商品信息，为渲染界面做准备
    formatProductInfo = async(originInfo) => {
        //从区块链里拿到的信息是这样的 res为
        // 0: BN {negative: 0, words: Array(2), length: 1, red: null}
        // 1: "1212"
        // 2: "艺术品,画作"
        // 3: 字符串数组 //product.imageLinkHash
        // 4: "Qmbc2XnQMmBjCPaXqWvPii1taM6VpvaWaDCGPMEm6y57nm" //product.descHash
        // 5: Array(3)
            // 0: BN 开始时间(秒)
            // 1: BN 结束时间(秒)
            // 2: BN 揭示报价时长(分)
        // 6: BN  //product.startPrice
        // 7: BN  //product.status
        // 8: BN  //product.condition

        let oneProductInfo = {};
        //格式化数据后为
        // ID
        // name
        // category
        // imageUrlArray URL字符串数组
        // descString
        // productCondition 全新 or 二手
        // price
        // originPrice
        // processTime
        // auctionStartTime
        // auctionEndTime
        // auctionRevealTime
        // sellStatus 正在拍卖 or 卖出 or 未卖出

        oneProductInfo.ID = parseInt(originInfo[0]);
        oneProductInfo.name = originInfo[1];
        oneProductInfo.category = originInfo[2];

        //处理图片Url数组
        let imageHashArray = originInfo[3];
        let imageLinkArray = [];
        let arrayLength = imageHashArray.length;
        console.log("在详情页中渲染 "+ arrayLength + " 张图片");
        for(let index = 0; index < arrayLength; index++){
            imageLinkArray[index] = ipfsReadUrlBefore + imageHashArray[index];
        }
        oneProductInfo.imageUrlArray = imageLinkArray;

        let descString = "商品介绍占位";
         await ipfs.cat(originInfo[4]).then(file => {
             descString = file.toString();
         })
        oneProductInfo.descString = descString;
        oneProductInfo.descLink = originInfo[4];
        oneProductInfo.productCondition = (originInfo[8] ===0) ? "全新" : "二手";
        oneProductInfo.price = handlePrice(originInfo[6]);
        oneProductInfo.originPrice = originInfo[6];

        //把三个时间从数组 originInfo[5] 中拿出来
        //这三个都是 bignumber
        let auctionStartTime = originInfo[5][0];
        let auctionEndTime = originInfo[5][1];
        let auctionRevealTime = originInfo[5][2];
        oneProductInfo.processTime = handleTimeString(auctionEndTime, "sell"); //这里先写死了
        //这个是原始数据
        oneProductInfo.auctionOriginEndTime = auctionEndTime;
        //这三个要格式化
        oneProductInfo.auctionStartTime = moment(parseInt(auctionStartTime)*1000).format('yy年M月D日, h:mm:ss a');   
        oneProductInfo.auctionEndTime = moment(parseInt(auctionEndTime)*1000).format('yy年M月D日, h:mm:ss a');
        oneProductInfo.auctionRevealTime = parseInt(auctionRevealTime);
        oneProductInfo.auctionRevealEndTime = moment(( parseInt(auctionEndTime) + 60*parseInt(auctionRevealTime) ) *1000).format('yy年M月D日, h:mm:ss a');

        oneProductInfo.sellStatus = (originInfo[7] ==0) ? "正在拍卖" : ((originInfo[7] ==1) ? "已售出" : "未售出");
        return oneProductInfo;
    }

    
    render () {
        //如果 cookie 中记录了 ID
        // if(cookie.load('searchProductID') !== undefined){
        //用 cookie 来判断显示哪个界面，要点两次提交，才能跳转到商品详情界面，并且传入了两个商品，改为使用 this.state.dataArray 是否有数据判断就好了
        if(this.state.dataArray.length !== 0){
            let productData = this.state.dataArray[0];

            //竞拍结束时间
            const bidDeadline = productData.auctionOriginEndTime * 1000; // 以毫秒为单位
            //揭示报价结束时间
            const revealDeadline = bidDeadline + productData.auctionRevealTime*60*1000 ; // 以毫秒为单位

            const { Title, Paragraph, Text, Link } = Typography;

            //倒计时结束时触发
            function onFinish() {
                console.log("finished!");
              }

            return (
                <div>        
        
                    <Typography>

                    <Row
                        align="middle"
                        justify="center"
                    >
                        <Col span={24}>
                        <Paragraph>
                    <Carousel 
                        autoplay 
                        afterChange={() => console.log("轮番播放")}
                    >
                    {
                        productData.imageUrlArray.map (item => (
                            <div>
                                <Image 
                                    height={400}
                                    src={item}
                                    fallback="%PUBLIC_URL%/images/nullicon.svg"
                                   />
                            </div>
                        ))
                    }  
                    </Carousel>
                    </Paragraph>
                    

                    <Paragraph>
                    <Image.PreviewGroup>
                    {
                        productData.imageUrlArray.map (item => (
                                <Image height={40} width={40} src={item} fallback="%PUBLIC_URL%/images/nullicon.svg"/>
                        ))
                    }
                    </Image.PreviewGroup>
                    </Paragraph>
                        </Col>
                    </Row>
                    
                    <Divider />


                    <Row>
                        <Col span={12}>
                            

                        <Paragraph>
                        <p><Title level={3}>{productData.name}</Title> <Tag  color="default">{productData.sellStatus}</Tag></p>
                        
                        </Paragraph>

                        <Paragraph>
                        <span>
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            ID: {productData.ID}
                        </Tag>
                        <Tag icon={<MinusCircleOutlined />} color="default">
                            {productData.category}
                        </Tag>
                        <Tag icon={<ExclamationCircleOutlined />} color="warning">
                            {productData.productCondition}
                        </Tag>
                        <Tag icon={<ClockCircleOutlined />} color="default">
                            揭示报价时长 {productData.auctionRevealTime} 分钟
                        </Tag>
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            区块链存证技术
                        </Tag>
                        </span>
                        </Paragraph>
                        


                        <div>
                        <p> </p>
                        <p> </p>

                        <Paragraph>
            
            <Card
                hoverable
                style={{ width: 400 }}
                
            >
                
    

    <div>

                    
        {
            this.state.bidVisible?(

                <div>

                <Col span={18} style={{ marginTop: 4 }}>
                <Countdown 
                title="出示报价剩余时间" 
                value={bidDeadline} 
                format="D 天 H 时 m 分 s 秒"
                onFinish={onFinish}
                 />
                </Col>
                <Meta description="起拍价"/>
                <p> <b>{productData.price}</b></p>
                <p></p>

                
                <Bid 
            //web3 和 truffleContract 由父组件传递进去，不用子组件自己生成
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            startPrice={productData.price}
            dataArray={this.state.dataArray}
                ></Bid>

                </div>
            ):null
        }
    </div>

    <div>
        {
            this.state.revealVisible?(
                <div>

                <Col span={18} style={{ marginTop: 4 }}>
                <Countdown 
                title="揭示报价剩余时间" 
                value={revealDeadline} 
                format="D 天 H 时 m 分 s 秒"
                onFinish={onFinish}
                 />
                </Col>
                <Meta description="起拍价"/>
                <p> <b>{productData.price}</b></p>
                <p></p>
                
                <Reveal 
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            dataArray={this.state.dataArray}
                ></Reveal>

                </div>
            ):null
        }
    </div>

    <div>
        {
            this.state.finalizeVisible?(
                <div>
                    
                <Col span={18} style={{ marginTop: 4 }}>
                <Countdown 
                title="揭示报价剩余时间" 
                value={revealDeadline} 
                format="D 天 H 时 m 分 s 秒"
                onFinish={onFinish}
                 />
                </Col>
                <Meta description="起拍价"/>
                <p> <b>{productData.price}</b></p>
                <p></p>
                
                <Finalize 
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            dataArray={this.state.dataArray}
            onFinish={onFinish}
            // showResell={this.showResellButton}
            //向溯源合约写入信息
            // tracingContract={this.state.tracingContract}
                ></Finalize>

                </div>
            ):null
        }
    </div>

    <div>
        {
            this.state.highestBidderInfoVisible?(
                <div>
                
                <HighestBidderInfo 
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            dataArray={this.state.dataArray}
            resellProcess={this.setResellProcess}
            //向溯源合约写入信息
            // tracingContract={this.state.tracingContract}
                ></HighestBidderInfo>

                </div>
            ):null
        }
    </div>


    <div>
        {
            this.state.escrowInfoVisible?(
                <div>
                
                <EscrowInfo
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            offButton ={this.offReleaseAndRefund}
            showButton={this.showReleaseAndRefund}
            showResell={this.showResellButton}
            dataArray={this.state.dataArray}
            //向溯源合约写入信息
            // tracingContract={this.state.tracingContract}
                ></EscrowInfo>

                </div>
            ):null
        }
    </div>

    <div>
        {
            this.state.releaseAndRefundFundsVisible?(
                <div>
                
                <ReleaseFunds 
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            dataArray={this.state.dataArray}
            //向溯源合约写入信息
            // tracingContract={this.state.tracingContract}
                ></ReleaseFunds>

                <RefundFunds 
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            dataArray={this.state.dataArray}
            //向溯源合约写入信息
            // tracingContract={this.state.tracingContract}
                ></RefundFunds>

                </div>
            ):null
        }
    </div>

    <div>

                    
        {
            this.state.resellVisible?(

                <div>
                
                <Resell
            //web3 和 truffleContract 由父组件传递进去，不用子组件自己生成
            web3={this.state.web3}
            truffleContract={this.state.truffleContract}
            productId={productData.ID}
                ></Resell>

                </div>
            ):null
        }
    </div>
        

            </Card>
            </Paragraph>
      

      
    </div>



                        </Col>
                        <Col span={12}>

                        <div>
                        <Text strong>竞拍流程</Text>
                        <p></p>
        <Timeline pending="进行中" >

          <Timeline.Item >
              <div>
          {
            this.state.startTimeVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>竞价开始时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionStartTime}</Tag></p></Tag>
            ):<p>竞价开始时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionStartTime}</Tag></p>
        }
        </div>
              </Timeline.Item>

              <Timeline.Item>
              <div>
          {
            this.state.bidVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>竞价人匿名出价，并支付押金</p></Tag>
            ):<p>竞价人匿名出价，并支付押金</p>
        }
        </div>
            </Timeline.Item>
            
            <Timeline.Item>
            <div>
          {
            this.state.bidVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>竞价结束时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionEndTime}</Tag></p></Tag>
            ):<p>竞价结束时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionEndTime}</Tag></p>
        }
        </div>
              </Timeline.Item>

              <Timeline.Item>
              <div>
          {
            this.state.revealVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>竞价人揭示报价，取回多余押金</p></Tag>
            ):<p>竞价人揭示报价，取回多余押金</p>
        }
        </div>    
            </Timeline.Item>
          
          <Timeline.Item>
          <div>
          {
            this.state.revealVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>揭示结束时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionRevealEndTime}</Tag></p></Tag>
            ):<p>揭示结束时间<Tag icon={<ClockCircleOutlined />} color="default">{productData.auctionRevealEndTime}</Tag></p>
        }
        </div> 
          </Timeline.Item>

          <Timeline.Item>
          <div>
          {
            this.state.finalizeVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>等待仲裁人加入，生成资金托管合约</p></Tag>
            ):<p>等待仲裁人加入，生成资金托管合约</p>
        }
        </div>        
          </Timeline.Item>

          <Timeline.Item>
          <div>
          {
            this.state.highestBidderInfoVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>公布最高出价人身份</p></Tag>
            ):<p>公布最高出价人身份</p>
        }
        </div>       
          </Timeline.Item>

          <Timeline.Item>
          <div>
          {
            this.state.releaseAndRefundFundsVisible?(
                <Tag icon={<SyncOutlined spin />} color="processing"><p>买家、卖家、仲裁人投票</p></Tag>
            ):<p>买家、卖家、仲裁人投票</p>
        }
        </div>   
          </Timeline.Item>

          <Timeline.Item>
          <div>
          {
            (true == this.state.escrowInfoVisible && false == this.state.releaseAndRefundFundsVisible)?(
                <Tag icon={<CheckCircleOutlined />} color="success"><p>触发智能合约，达成交易</p></Tag>
            ):<p>触发智能合约，达成交易</p>
        }
        </div>
                
          </Timeline.Item>
          
        </Timeline>
      </div>




                       




                    
                        </Col>
                    </Row>

                    <Divider />

                    <Row>
                        <Col span={12}>
                            
                        <Text strong>商品介绍</Text>
                        <p></p>
    <Paragraph>
      {productData.descString}
    </Paragraph>

    <Paragraph>
      <ul>

      {
                        productData.imageUrlArray.map ((item,index) => (
                            <li>
                            <Link href={item}>商品图片链接{index+1}</Link>
                            </li>
                        ))
    }  
        <li>
          <Link href={ipfsReadUrlBefore + productData.descLink}>商品介绍链接</Link>
        </li>
        <p>Power by IPFS星际文件系统</p>
      </ul>
    </Paragraph>
                        


                        </Col>


                        <Col span={12}>
                        <Paragraph>
                        <Text strong>关键点溯源</Text>
                        <p></p>

                        <Tracing 
                    web3={this.state.web3}
                    //读取溯源合约上的信息
                    // tracingContract={this.state.tracingContract}
                    //入口合约
                    truffleContract={this.state.truffleContract}
                    //拍卖商品类
                    class={1}
                    id={productData.ID}
                        ></Tracing>
                        
                    </Paragraph>
                  </Col>
                    </Row>
                    
                                   
                    


  </Typography>
  
    
        </div>
            );
        }

        //如果cookie 中没有记录，就询问用户要查询的信息
        else {
            return (
                <div style={{display:'flex', justifyContent:'center'}}>
                <Card title="查询商品" bordered={false} style={{ width: '80%' }} headStyle={{display:'flex', justifyContent:'center'}}>
                    <Form
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={this.onFinish}
                        onFinishFailed={this.onFinishFailed}
                        style={{margin:"auto", width:"60%", marginTop:"15px"}}
                    >
                        <Form.Item
                            name="ProductID"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入商品ID',
                                },
                            ]}
                        >
                            <InputNumber placeholder="商品ID" 
                            style={{
                            width: '100%',
                            }}/>
                        </Form.Item>
    

    
                        <Form.Item
                            wrapperCol={{
                                offset: 10,
                                span: 16,
                            }}
                        >
                            <Button disabled={ this.state.truffleContract === null || this.state.web3 === null } type="primary" htmlType="submit">
                                查询
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
            );
        }
        
    }
}

export default ProductInfo;

