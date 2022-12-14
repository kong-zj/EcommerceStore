import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";

const { Option } = Select;

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



class Reveal extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }

    async componentDidMount () {
        console.log("生成Reveal模块");
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
    onFinishReveal = (values) => {
        console.log("揭示报价提交按钮被点击，onFinishReveal 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意
        // BidSecret: "k10"
        // PriceUnit: "ETH"
        // RevealAmount: 4

        if(this.props.dataArray.length === 0){
            message.error("找不到正在竞拍的商品");
            return;
        }
        if(values.PriceUnit === undefined){
            message.error("请指定价格单位");
            return;
        }

        let web3 = this.props.web3;
        //把价格单位换算成wei进行比较，这里的换算写死了，后期改成 web3 中的换算方法
        console.log("揭示报价使用的价格单位 : " + values.PriceUnit);

        //处理价格，把单位转为 wei
        let revealPrice = -1;
        if(values.PriceUnit === "ETH"){
          revealPrice = web3.utils.toWei(values.RevealAmount+"", 'ether');
        }else if(values.PriceUnit === "wei"){
          revealPrice = parseInt(values.RevealAmount);
        }
        console.log("揭示价 : " + revealPrice);
        let blockChainID = this.props.dataArray[0].ID;
        console.log("竞拍商品ID : " + blockChainID);

        //这里与 Bid 中的相同部位不同，Bid在这里加密，在传给区块链方法
        //Reveal 这里不加密，将明文传递给区块链方法

        //揭示报价信息上链
        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await web3.eth.getAccounts();
            message.info("交易发起地址为: "+currentAccount, 2);
            console.log("交易发起地址为: "+currentAccount);

            try{
                //调用合约的 revealBid 方法
                //传入两个不同格式的 revealPrice
                await i.revealBid(parseInt(blockChainID), revealPrice.toString(), revealPrice, values.BidSecret, { from: currentAccount.toString(), gas:440000 }).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("揭示报价成功");
                    console.log("成功调用合约的revealBid方法，返回 : ");
                    console.dir(res);
                    //关闭侧边栏
                    this.onClose();
                    openNotification("揭示报价成功",
                                    "您的报价: " + values.RevealAmount + values.PriceUnit + ", 您多余的押金已经退回, 在揭示报价时间截止时, 平台自动使用次高报价, 撮合最高报价者与卖家交易" ,
                                    'bottomLeft');
                });
            }catch(err) {
                message.error("向链上提交揭示竞价信息失败",2);
                console.log("调用合约的revealBid方法失败 ");
                console.dir(err);
                return;
            }  
        });

    }


    //点击提交竞拍按钮，表单不能提交时
    onFinishFailedReveal = (errorInfo) => {
        message.warning("请正确填写竞拍信息",2);
    }

   

 
    
    render () {
        return (


          <div>

            <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                揭示报价
            </Button>

            <Drawer
          title="揭示您的报价"
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
            <Divider />
          <Form 
            layout="vertical" hideRequiredMark
            onFinish={this.onFinishReveal}
            onFinishFailed={this.onFinishFailedReveal}
            
          >
            <Form.Item
                name="RevealAmount"
                label="揭示报价"
                rules={[
                        {
                            required: true,
                            message: '请揭示竞拍价格',
                        },
                ]}
            >
            <InputNumber
                min={0}
                placeholder="竞拍时输入的价格"
                addonAfter={suffixSelector}
                style={{
                    width: '100%',
                }}
            />
            </Form.Item>
            <Form.Item
                name="BidSecret"
                label="加密口令"
                rules={[
                        {
                            required: true,
                            message: '请与在竞价环节中输入的加密口令一致',
                        },
                ]}
            >
                <Input.Password
                placeholder="您在竞价环节中使用的加密口令"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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

export default Reveal;
