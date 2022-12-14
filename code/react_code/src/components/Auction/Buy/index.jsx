import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
// import getWeb3 from "../../../utils/getWeb3";
// import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";

const { Option } = Select;



class Buy extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }

    componentDidMount () {
         console.log("生成Buy模块");
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
    onFinishBuy = (values) => {
        console.log("购买按钮被点击，onFinishBuy 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意
        // buyNum: 2

        
        if(values.buyNum > this.props.dataArray[0].inStockNum){
          message.error("库存不足");
          return;
        }

        if(this.props.dataArray.length == 0){
            message.error("找不到被购买的商品");
            return;
        }

        //计算需要支付的金额
        let price = this.props.dataArray[0].originPrice;
        //单位是wei
        let priceSum = price * values.buyNum;
        
        let blockChainID = this.props.dataArray[0].ID;
        console.log("购买商品ID : " + blockChainID);


        let web3 = this.props.web3;

        //购买信息上链

        //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
        //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败

            try{
                //调用合约的 order 方法
                //即时获取当前地址，用该地址发交易
                let currentAccount = await web3.eth.getAccounts();
                message.info("交易发起地址为: "+currentAccount, 2);
                console.log("交易发起地址为: "+currentAccount);

                await i.order(parseInt(blockChainID), values.buyNum, { from: currentAccount.toString(), value: priceSum}).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("购买提交成功");
                    console.log("成功调用合约的buy方法，返回 : ");
                    console.dir(res);
                    //关闭侧边栏
                    this.onClose();
                    openNotification("购买信息提交成功",
                                    "购买个数: " + values.buyNum ,
                                    'bottomLeft');
                });
            }catch(err) {
                message.error("向链上提交购买信息失败",2);
                console.log("调用合约的buy方法失败, err = ");
                console.dir(err);
                return;
            }  
        });

    }

    //点击购买按钮，表单不能提交时
    onFinishFailedBuy = (errorInfo) => {
        message.warning("请正确填写购买信息",2);
    }
    
    render () {
        return (


            <div>

                <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                购买
                </Button>

            <Drawer
          title="输入购买数量"
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
            <p>售价: <b>{this.props.price}</b></p>
            <p></p>
            <p>库存: <b>{this.props.sumNum}</b></p>
            <Divider />
          <Form 
            layout="vertical" hideRequiredMark
            onFinish={this.onFinishBuy}
            onFinishFailed={this.onFinishFailedBuy}
            
          >
            <Form.Item
                name="buyNum"
                label="购买个数"
                rules={[
                        {
                            required: true,
                            message: '请输入购买个数',
                        },
                ]}
            >
            <InputNumber
                min={0}
                placeholder="购买个数不可超过商品库存"
                style={{
                    width: '100%',
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

export default Buy;
