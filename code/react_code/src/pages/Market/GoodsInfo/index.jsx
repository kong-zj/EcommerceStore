import React, {Component} from 'react';
import cookie from 'react-cookies';
import ipfsAPI from 'ipfs-api';
// import EditDeviceModal from "../../EditDeviceModal";
import { message, Card, Carousel, Drawer, Tag, Progress} from 'antd';
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
import Buy from '../../../components/Auction/Buy';
//揭示报价模块
import Sell from '../../../components/Auction/Sell';


//溯源信息展示模块
import Tracing from '../../../components/Tracing'; 

//接入合约
import getWeb3 from "../../../utils/getWeb3";
import getShopping from "../../../utils/getShopping";
import getTracing from '../../../utils/getTracing';

//从IPFS读取
import ipfsReadUrlBefore from '../../../config/ipfsReadUrl';
import ipfsAddAndCatConfig from '../../../config/ipfsAddAndCat';

//价格格式化
import handlePrice from '../../../utils/handlePrice';
//地址解析
import handleAddress from '../../../utils/handleAddress';

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
        //购买按钮
        buyVisible : false,
        //只有卖家可见按钮
        sellVisible : false,
    }

    constructor (props) {
        super(props);
    }


    //清除cookie
    componentWillUnmount () {
        cookie.remove('searchGoodsID', { path: '/' });
    }

    getBlockChainInfo = async() => {
        try{
            const web3 = await getWeb3();
            const Shopping = await getShopping(web3);
            const Tracing = await getTracing(web3);
            this.setState({
                web3: web3,
                truffleContract:Shopping,
                tracingContract:Tracing
                
            });
            message.success("接入智能合约成功", 2);
            console.log("ProductInfo 的 web3 : ");
            console.dir(web3);
            console.log("ProductInfo 的 Shopping : ");
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

    //componentWillMount在render之前运行
    //componentDidMount 在render之后运行
    //注意先后顺序，this.getBlockChainInfo 在前，that.renderGoodDetails 在后
    async componentDidMount () {
    // componentWillMount () {
        let that = this;
        console.log("生成GoodInfo模块");
        if(await this.getBlockChainInfo()){
            console.log("获得合约信息成功");

            console.log("componentDidMount 中查询 cookie:searchGoodsID 为 : " + cookie.load('searchGoodsID'));
            console.log("componentDidMount 中查询 this.state.dataArray 的长度为 : " + this.state.dataArray.length);
            //利用 cookie，如果 cookie 中有商品ID，但是这个商品未显示，那就将它显示出来
            //有了这个功能，从商品列表跳转到某个商品的详情页，不需要做其他操作
            if(cookie.load('searchGoodsID') !==undefined && this.state.dataArray.length === 0) {
                console.log("用 cookie 中包含的商品ID信息，加载商品详情页");
                let arg = {};
                arg.ProductID = cookie.load('searchGoodsID');
                that.renderGoodsDetails(arg);
            }
        }else{
            console.log("获得合约信息失败");
        }
    }


    //控制显示与隐藏
    //初始状态都为 false
    // //购买按钮
    // buyVisible 
    // //只有卖家可见按钮
    // sellVisible 
    
    controlButtonAndInfo = async (p) => {
        //从区块链里拿到的信息是这样的 res为
        // 0: BN  ID
        // 1: String  name
        // 2: String  class
        // 3: [string] imageLink
        // 4: string descLink
        // 5: BN price
        // 6: BN shippingTime
        // 7: BN inStockNum
        // 8: (2) [BN, BN] originPlace
        // 9: BN status

        // 0:open, 1:sold
        let productStatus = parseInt(p[9]);

        //如果该地址是卖家，显示出售按钮
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
                        //显示卖家出售按钮
                        this.setState({
                            sellVisible : true,
                        })
                    }
                    
                });  
            }catch(err) {
                message.error("id = " + productId + "的商品的seller信息查询失败",2);
                console.log("调用合约的sellerInfo方法失败 " + err);
            }

            
        });


        //p[9] = open
        if (productStatus == 0) {
            console.log("商品状态为 open");
            this.setState({
                //开放购买按钮
                buyVisible : true,
            })
        }
        //p[9] = sold
        else if (productStatus == 1) {
            console.log("商品状态为 sold");
            this.setState({
                //关闭购买按钮
                buyVisible : false,
            })
        }
        
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
            this.renderGoodsDetails(decodedParams);
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
    renderGoodsDetails = (params) => {

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
        this.state.truffleContract.deployed().then( async (i) => {
            console.log("进入 this.state.truffleContract.deployed() 的回调函数");
            try{
                //即时获取当前地址，用该地址发交易
                let currentAccount = await that.state.web3.eth.getAccounts();
                i.getGoods(productId, { from: currentAccount.toString()}).then(async res => {
                    //可能返回为空，要判断是否真的取到了数据，如果不判断，直接调用 formatProductInfo(res)，里面的 ipfs 会报错
                    console.log("getGoods 取到的原始数据为 : ");
                    console.dir(res);
                    //通过 res[1]，也就是产品的name是否为空来判断
                    if(res[1]===""){
                        message.error("该ID没有对应的商品",2);
                        return;
                    }
                    //根据当前的 res 状况，判断显示什么信息
                    this.controlButtonAndInfo(res);

                    //格式化数据，便于显示
                    let oneProductInfo = await this.formatProductInfo(res);
                    console.log("格式化之后的数据 oneProductInfo 为 ");
                    console.dir(oneProductInfo);

                    this.setState({
                        dataArray : [...this.state.dataArray, oneProductInfo]
                    });

                    //设置cookie，不怕刷新
                    cookie.save('searchGoodsID', productId, {path:'/'});
                    message.success("商品ID查询成功",2);
                    
                });  
            }catch(err) {
                message.error("商品ID查询失败",2);
                console.log("调用合约的getGoods方法失败 " + err);
            }

            
        });
    }

    //格式化商品信息，为渲染界面做准备
    formatProductInfo = async(originInfo) => {
        //从区块链里拿到的信息是这样的 res为
        // 0: BN  ID
        // 1: String  name
        // 2: String  class
        // 3: [string] imageLink
        // 4: string descLink
        // 5: BN price
        // 6: BN shippingTime
        // 7: BN inStockNum
        // 8: (2) [BN, BN] originPlace
        // 9: BN status

        let oneProductInfo = {};
        //格式化数据后为
        // ID
        // name
        // category
        // imageUrlArray URL字符串数组
        // descString
        // price
        // originPrice
        // shippingTime
        // inStockNum
        // originPlace int数组
        // sellStatus 正在售卖 or 已售空 

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

        oneProductInfo.price = handlePrice(originInfo[5]);
        oneProductInfo.originPrice = originInfo[5];
        oneProductInfo.shippingTime = parseInt(originInfo[6]);
        oneProductInfo.inStockNum = parseInt(originInfo[7]);
        //把发货地址的 [int,int] 解析成 string
        oneProductInfo.originPlace = handleAddress([parseInt(originInfo[8][0]), parseInt(originInfo[8][1])]);

        // oneProductInfo.sellStatus = (parseInt(originInfo[9]) ==0) ? "正在售卖" : "已售空";
        oneProductInfo.sellStatus = parseInt(originInfo[9]);
        return oneProductInfo;
    }

    
    render () {
        //如果 cookie 中记录了 ID
        // if(cookie.load('searchGoodsID') !== undefined){
        //用 cookie 来判断显示哪个界面，要点两次提交，才能跳转到商品详情界面，并且传入了两个商品，改为使用 this.state.dataArray 是否有数据判断就好了
        if(this.state.dataArray.length !== 0){
            let productData = this.state.dataArray[0];

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
                        <Title level={3}>{productData.name}</Title>
                        {productData.sellStatus}
                        </Paragraph>

                        <Paragraph>
                        <span>
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            ID: {productData.ID}
                        </Tag>
                        <Tag icon={<MinusCircleOutlined />} color="default">
                            {productData.category}
                        </Tag>
                        <Tag icon={<SyncOutlined />} color="default">
                            {productData.originPlace}
                        </Tag>
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            区块链存证技术
                        </Tag>
                        </span>
                        </Paragraph>

                        <div>

    </div>


                        </Col>
                        <Col span={12}>




                        <Paragraph>
                    <Card
                        hoverable
                        style={{ width: 400 }}
                        
                    >
                        <Col span={18} style={{ marginTop: 4 }}>

                        </Col>

                        <Meta description="售价"/>
                <p> <b>{productData.price}</b></p>
                <p></p>
                        <Meta description="库存"/>
                <p> <b>{productData.inStockNum}</b></p>
                <p></p>

            <div>

                            
                {
                    this.state.buyVisible?(
                        <div>
                        
                        <Buy
                    //web3 和 truffleContract 由父组件传递进去，不用子组件自己生成
                    web3={this.state.web3}
                    truffleContract={this.state.truffleContract}
                    price={productData.price}
                    dataArray={this.state.dataArray}
                    //库存数量
                    sumNum={productData.inStockNum}
                        ></Buy>

                        </div>
                    ):null
                }
            </div>

            <div>
                {
                    this.state.sellVisible?(
                        <div>
                        
                        <Sell 
                    web3={this.state.web3}
                    truffleContract={this.state.truffleContract}
                    dataArray={this.state.dataArray}
                        ></Sell>

                        </div>
                    ):null
                }
            </div>



                

            
                    </Card>
                    </Paragraph>




                    
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
    <Text strong>商品溯源</Text>
    <p></p>

    <Tracing 
web3={this.state.web3}
//读取溯源合约上的信息
// tracingContract={this.state.tracingContract}
//入口合约
truffleContract={this.state.truffleContract}
//普通商品类
class={2}
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

