import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select, Slider, DatePicker } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
// import getWeb3 from "../../../utils/getWeb3";
// import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

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



class Resell extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }

    componentDidMount () {
         console.log("生成Resell模块");
    }

    showDrawer = () => {
        this.setState({
          visible: true,
        });
      };
    
    onClose = () => {
        this.setState({
          visible: false,
        });
      };
      
    //点击提交竞拍按钮，表单可以提交时
    onFinishResell = (values) => {
        console.log("竞拍提交按钮被点击，onFinishBid 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意
        // BeginAndEndTime (长度为2的Moment数组)
        // PriceUnit: "ETH"
        // ProductRevealTime: 7
        // StartPrice: 11

        if(values.PriceUnit === undefined){
            message.error("请指定价格单位");
            return;
        }
        let web3 = this.props.web3;

        //处理时间成int
        let auctionStartTime = Date.parse(values.BeginAndEndTime[0]) / 1000;
        let auctionEndTime = Date.parse(values.BeginAndEndTime[1]) / 1000;

        //处理价格，把单位转为 wei
        let startPrice = -1;
        if(values.PriceUnit === "ETH"){
            startPrice = web3.utils.toWei(values.StartPrice.toString(), 'ether');
        }else if(values.PriceUnit === "wei"){
            startPrice = parseInt(values.StartPrice);
        }

        //处理揭示报价时间，从String变成int
        let productRevealTime = parseInt(values.ProductRevealTime);

        // 处理后的值, 需要传入区块链
        // auctionStartTime
        // auctionEndTime
        // startPrice
        // productRevealTime
        // this.props.productId

        //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
        //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await web3.eth.getAccounts();
            message.info("交易发起地址为: "+currentAccount, 2);
            console.log("交易发起地址为: "+currentAccount);

            try{
                //调用合约的 bid 方法
                await i.changeInfoToSellAgain(parseInt(this.props.productId), auctionStartTime, auctionEndTime, startPrice, productRevealTime, 
                { from: currentAccount.toString()}).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("转卖发起成功");
                    console.log("成功调用合约的changeInfoToSellAgain方法，返回 : ");
                    console.dir(res);
                    //关闭侧边栏
                    this.onClose();
                    openNotification("转卖发起成功",
                    "起拍价格: " + values.StartPrice + values.PriceUnit + ", 拍卖开始时间: " + moment(values.AuctionStartTime).format('yy年M月D日, h:mm:ss a') + ", 拍卖结束时间: " + moment(values.AuctionEndTime).format('yy年M月D日, h:mm:ss a'),
                                    'bottomLeft');
                });
            }catch(err) {
                message.error("向链上提交竞价信息失败",2);
                console.log("调用合约的bid方法失败, err = ");
                console.dir(err);
                return;
            }  
        });

    }

    //点击提交竞拍按钮，表单不能提交时
    onFinishFailedBid = (errorInfo) => {
        message.warning("请正确填写竞拍信息",2);
    }

    //智能合约中的方法需传入
    // uint _productId(this.props.productId), 
    // uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _auctionRevealTime (这四个需要用户输入)
    
    render () {
        return (


            <div>

                <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                转卖
                </Button>

            <Drawer
          title="转卖商品"
          width={400}
          onClose={this.onClose}
          visible={this.state.visible}
          bodyStyle={{ paddingBottom: 80 }}
          extra={
            <Space>
              <Button onClick={this.onClose}>取消</Button>
            </Space>
          }
        >
          <Form 
            layout="vertical" hideRequiredMark
            onFinish={this.onFinishResell}
            onFinishFailed={this.onFinishFailedBid}
          >

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
            
            <Form.Item>
                <Button 
                type="primary" 
                htmlType="submit"
                disabled={ this.props.truffleContract === null || this.props.web3 === null } 
                >
                提交
              </Button>
            </Form.Item>

          </Form>
        </Drawer>

            </div>
        );
    }
}

export default Resell;
