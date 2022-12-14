import React, {Component} from 'react';
import axios from "axios";
import cookie from 'react-cookies';
import ipfsAPI from 'ipfs-api';
import { message, Card} from 'antd';
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
  } from 'antd';
// import axios from "axios";
// import cookie from "react-cookies";

import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

//显眼的提示
import openNotification from '../../../components/Notification';
//时间格式化


//接入合约
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";

//静态资源
import ProductClass from '../../../static/ProductClass';

//ipfs配置文件
import ipfsAddAndCatConfig from '../../../config/ipfsAddAndCat';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;

//ipfs实例
const ipfs = ipfsAPI({ host: ipfsAddAndCatConfig.host, port: ipfsAddAndCatConfig.port, protocol: ipfsAddAndCatConfig.protocol });


const suffixSelector = (
    <Form.Item name="PriceUnit" noStyle>
      <Select
        style={{
          width: 70,
        }}
      >
        <Option selected="selected" value="ETH">ETH</Option>
        <Option value="wei">wei</Option>
      </Select>
    </Form.Item>
);

  const rangeConfig = {
    rules: [
      {
        type: 'array',
        required: true,
        message: '请选择时间',
      },
    ],
  };




//向区块链写入商品信息
class AuctionOut extends Component {

    state = {
        username:cookie.load('username'),
        web3 : null,
        truffleContract : null,
        //读取上传的图片
        picReader : []
    }

    constructor (props) {
        super(props);
    }

    //当文件选择变化时
    //getValueFromEvent调用它
    normFile = (e) => {
        console.log("上传图片的 getValueFromEvent 调用");
        console.log(e);
        let reader = [];

        //清空，防止重复上传
        this.setState({
            picReader: null
        });

        //如果列表里至少有一张图片的话
        let fileLength = e.fileList.length;
        if(fileLength !== 0){
            //用下标索引可以拿到更多张
            for(let index=0; index<fileLength; index++){
                const file = e.fileList[index].originFileObj;
                reader[index] = new window.FileReader();
                reader[index].readAsArrayBuffer(file);
                console.log("读取第 " + (index+1) + " 张图片");
            }  
        }else{
            //清空，防止上传已经取消的
            reader = null;
            console.log("图片列表为空");
        } 
        //在方法的最外层使用 this.setState 更新值，不然组件会一直处于uploading状态
        this.setState({
            picReader: reader
        });
        console.log("this.state.picReader : ");
        console.log(this.state.picReader);
    }


    //customRequest调用它
    uploadFile = (e) => {
        message.info("正在上传图片", 2);
        console.log("上传图片的 customRequest 调用");
        console.log(e);
        //判断是否上传完成
        if(this.state.picReader !== null){
            //告诉组件成功了，不要一直 uploading
            e.onSuccess(200,this.state.picReader);
        }
      }

    

    getBlockChainInfo = async() => {
        try{
            const web3 = await getWeb3();
            const EcommerceStore = await getEcommerceStore(web3);
            this.setState({
                web3: web3,
                truffleContract:EcommerceStore
            });
            message.success("接入智能合约成功", 2);
            console.log("AuctionOut 的 web3 : ");
            console.dir(web3);
            console.log("AuctionOut 的 EcommerceStore : ");
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
    componentDidMount () {
    // componentWillMount () {
        console.log("生成AuctionOut模块");
        if(this.getBlockChainInfo()){
            //注意，这里打印 this.state.truffleContract 为 null，因为异步执行
            // console.log("成功获得合约信息, this.state.truffleContract : ");
            // console.dir(this.state.truffleContract);
            console.log("获得合约信息成功");
        }else{
            console.log("获得合约信息失败");
        }
    }

    //点击提交按钮，表单可以提交时
    onFinish = (values) => {
        console.log("提交的数据为 : ");
        console.dir(values);
        //传过来的数据为
        //values 已经是json格式了
        //ProductName (String)
        //ProductDesc (String)
        //this.state.picReader (数组)
        //ProductRevealTime (int)
        //ProductCondition (String)
        //BeginAndEndTime (长度为2的Moment数组)
        //ProductClass (字符串数组)
        //StartPrice (int)
        //PriceUnit (String)
        //ProductRevealTime (int) 单位是分钟

        //如果数据不合法，阻止上链
        if(values.PriceUnit === undefined){
            message.error("未选择价格单位", 2);
            return;
        }

        //UploadPic用不到，从字典中删掉
        //优化传参大小
        delete values.UploadPic;
        //把开始时间和结束时间拆分开，BeginAndEndTime 拆为 AuctionStartTime 和 AuctionEndTime
        let AuctionStartTime = values.BeginAndEndTime[0]; 
        let AuctionEndTime = values.BeginAndEndTime[1]; 
        values.AuctionStartTime = AuctionStartTime;
        values.AuctionEndTime = AuctionEndTime;
        delete values.BeginAndEndTime;

        
        // console.log('onFinish 的 values : ', values);

        let decodedParams = {};
        Object.keys(values).forEach(key => {
            decodedParams[key] = decodeURIComponent(decodeURI(values[key]));
        });
        // console.log('onFinish 的 values 解析为 decodedParams : ', decodedParams);

        //decodedParams 进一步格式化
        //参数全都变成String

        message.info("正在提交拍卖商品数据",2);
        try{
            this.saveProduct(this.state.picReader, decodedParams);
        }catch(err){
            // message.error("向链上提交商品数据出错",2);
            return;
        }
        // message.success("向链上提交商品数据成功",2);

    }


    //点击提交按钮，表单不能提交时
    onFinishFailed = (errorInfo) => {
        message.warning("请正确填写商品信息",2);
    }


    //向区块链保存商品入口函数
    saveProduct = (reader, decodedParams) => {
        //注意这里的各个函数里的this，已经不再是最外层的this，如果在内层用this，就调用不到外层的函数
        //想办法用that将外层的this传进去
        let that = this;
        let imageIdArray, descId;
        this.saveImageOnIpfs(reader).then(function(idArray) {
            imageIdArray = idArray;
            that.saveTextBlobOnIpfs(decodedParams["ProductDesc"]).then(function(id) {
                descId = id;
                //ProductDesc用不到，从字典中删掉
                //优化传参大小
                delete decodedParams.ProductDesc;
                //只传过去要上区块链的
                that.saveProductToBlockchain(decodedParams, imageIdArray, descId);
            });
        });
    }
    
    //图片上传ipfs并获取hash
    //一个商品对应多张图片
    saveImageOnIpfs = (reader) => {
        return new Promise((resolve, reject) => {
            //一共几张图片
            let readerLength = reader.length;
            //有图片传过来
            if(readerLength >0){
                //存放结果数组
                let hashArray = [];
                let isSuccess = true;
                for(let index=0; index < readerLength; index++){
                    let buffer = Buffer.from(reader[index].result);
                    //一次IPFS上传
                    ipfs.add(buffer).then(res => {
                        console.log("ImgRes: ", res);
                        hashArray[index] = res[0].hash;
                    }).catch(err => {
                        console.error(err);
                        isSuccess = false;
                        message.error("图片保存失败",2);
                        reject(err);
                    });

                }
                if(isSuccess){
                    message.success("图片保存成功", 2);
                }
                resolve(hashArray);
            //没传图片
            } else{
                message.info("未上传商品图片");
                resolve("");
            }
            
            
        });
    }
    
    //简介上传ipfs并获取hash
    saveTextBlobOnIpfs = (blob) => {
        return new Promise((resolve, reject) => {
            let buffer = Buffer.from(blob, 'utf-8');
            ipfs.add(buffer).then(res => {
                console.log("TextRes: ", res);
                message.success("简介文字保存成功",2);
                resolve(res[0].hash);
            }).catch(err => {
                console.error(err);
                message.error("简介文字保存失败",2);
                reject(err);
            });
        });
    }

    //调用区块链方法
    //由 imageId 改为 imageIdArray，图片由一张变多张
    saveProductToBlockchain = (params, imageIdArray, descId) => {
        // console.log("params in save product: ", params);

        if(this.state.truffleContract === null || this.state.web3 === null){
            message.error("连接合约失败",2);
            console.log("[ERROR]web3 或者 truffleContract 为 null");
            return;
        }

        //处理时间
        let auctionStartTime = Date.parse(params["AuctionStartTime"]) / 1000;
        let auctionEndTime = Date.parse(params["AuctionEndTime"]) / 1000;
        //处理价格，把单位转为 wei
        let startPrice = -1;
        if(params.PriceUnit === "ETH"){
            startPrice = this.state.web3.utils.toWei(params.StartPrice, 'ether');
        }else if(params.PriceUnit === "wei"){
            startPrice = parseInt(params.StartPrice);
        }
        //处理新旧状态，从String变成int
        let productCondition = parseInt(params.ProductCondition);
        //处理揭示报价时间，从String变成int
        let productRevealTime = parseInt(params.ProductRevealTime);

        //传来的数据已格式化为
        //params.ProductName (String)
        //descId (String)
        //imageIdArray (String数组)
        //auctionStartTime (int)
        //auctionEndTime (int)
        //productCondition (int)
        //params.ProductClass (String)
        //startPrice (int)
        //productRevealTime (int) 单位是分钟


        console.log("最终上传区块链的数据为 : ");
        console.log(params.ProductName);
        console.log(descId);
        console.log(imageIdArray);
        console.log(params.ProductClass);
        console.log(startPrice);
        console.log(auctionStartTime);
        console.log(auctionEndTime);
        console.log(productCondition);
        console.log(productRevealTime);

        console.log("合约为 : ");
        console.dir(this.state.truffleContract);
        
    
        //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
        //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
        let that = this;
        console.dir(this.state.truffleContract.deployed());
        this.state.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.state.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await that.state.web3.eth.getAccounts();
            message.info("交易发起地址为: "+currentAccount, 2);
            console.log("交易发起地址为: "+currentAccount);

            try{
                //由 imageId 改为 imageIdArray，图片由一张变多张
                //合约中实现事件event NewProduct监听
                await i.addProductToStore(params.ProductName, params.ProductClass, imageIdArray, descId, auctionStartTime,
                    auctionEndTime, startPrice, productCondition, productRevealTime, { from: currentAccount.toString()}).then(function(f) {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串

                    message.success("向链上提交商品数据成功",2);
                    //强提醒
                    openNotification("商品上链成功",
                    "商品名: " + params.ProductName  + ", 起拍价格: " + params.StartPrice + params.PriceUnit + ", 拍卖开始时间: " + moment(params.AuctionStartTime).format('yy年M月D日, h:mm:ss a') + ", 拍卖结束时间: " + moment(params.AuctionEndTime).format('yy年M月D日, h:mm:ss a'),
                    'bottomLeft');
                    console.log("成功调用合约的addProductToStore方法");
                    console.log(f);
                });  
            }catch(err) {
                message.error("向链上提交商品数据失败",2);
                console.log("调用合约的addProductToStore方法失败, err =");
                console.dir(err);
            }

            
        });
    }

    
    render () {
        return (
            <div style={{display:'flex', justifyContent:'center'}}>
            <Card title="上架待拍卖商品" bordered={false} style={{ width: '80%' }} headStyle={{display:'flex', justifyContent:'center'}}>
                <Form
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    style={{margin:"auto", width:"60%", marginTop:"15px"}}
                >
                    <Form.Item
                        name="ProductName"
                        rules={[
                            {
                                required: true,
                                message: '请输入商品名称',
                            },
                        ]}
                    >
                        <Input placeholder="商品名称"/>
                    </Form.Item>

                    <Form.Item
                        name="ProductDesc"
                        label="商品介绍"
                        rules={[
                                {
                                    required: true,
                                    message: '请输入商品介绍',
                                },
                        ]}
                    >
                        <Input.TextArea showCount maxLength={500} />
                    </Form.Item>

                    <Form.Item
                        name="UploadPic"
                        label="上传图片"
                        valuePropName="fileList"
                        getValueFromEvent={this.normFile}
                        extra=""
                    >
                        <Upload name="logo" 
                            customRequest={this.uploadFile} 
                            listType="picture">
                            <Button icon={<UploadOutlined />}>点击上传</Button>
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item
                        name="ProductClass"
                        label="商品种类"
                        rules={[
                                {
                                    type: 'array',
                                    required: true,
                                    message: '请选择商品种类',
                                },
                            ]}
                    >
                        <Cascader placeholder="请选择" options={ProductClass} />
                    </Form.Item>


                    <Form.Item
                        name="StartPrice"
                        label="起拍价格"
                        rules={[
                                {
                                    required: true,
                                    message: '请输入起拍价格',
                                },
                            ]}
                    >
                    <InputNumber
                        min={0}
                        addonAfter={suffixSelector}
                        style={{
                            width: '100%',
                        }}
                    />
                    </Form.Item>

                    <Form.Item name="BeginAndEndTime" label="起止时间" {...rangeConfig}>
                        <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>

                    <Form.Item
                        name="ProductCondition"
                        label="产品状况"
                        rules={[
                                {
                                    required: true,
                                    message: '请选择状况',
                                },
                        ]}
                    >
                        <Select placeholder="请选择">
                            <Option value="0">全新</Option>
                            <Option value="1">二手</Option>
                        </Select>
                    </Form.Item>


                    <Form.Item name="ProductRevealTime" label="揭示报价持续时间">
                        <Slider
                            marks={{
                                0: '0',
                                20: '20',
                                40: '40',
                                60: '60',
                                80: '80',
                                100: '100 分钟',
                            }}
                        />
                    </Form.Item>
                

                    <Form.Item
                        wrapperCol={{
                            offset: 10,
                            span: 16,
                        }}
                    >
                        <Button disabled={ this.state.truffleContract === null || this.state.web3 === null } type="primary" htmlType="submit">
                            发布商品
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
        );
    }
}

export default AuctionOut;

