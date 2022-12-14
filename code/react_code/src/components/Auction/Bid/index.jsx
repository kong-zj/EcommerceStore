import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
// import getWeb3 from "../../../utils/getWeb3";
// import getEcommerceStore from "../../../utils/getEcommerceStore";
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



class Bid extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }

    componentDidMount () {
         console.log("生成Bid模块");
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
    onFinishBid = (values) => {
        console.log("竞拍提交按钮被点击，onFinishBid 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意
        // BidAmount: 1
        // BidSecret: "33"
        // PriceUnit: "ETH"
        // SendAmount: 2

        if(this.props.dataArray.length === 0){
            message.error("找不到正在竞拍的商品");
            return;
        }
        if(values.PriceUnit === undefined){
            message.error("请指定价格单位");
            return;
        }
        //判断是否符合竞拍规则
        if(values.BidAmount > values.SendAmount){
            message.error("押金低于竞拍价", 2);
            return;
        }
        //把价格单位换算成wei进行比较，这里的换算写死了，后期改成 web3 中的换算方法
        console.log("竞拍使用的价格单位 : " + values.PriceUnit);
        let bidPrice = (values.PriceUnit === "ETH") ? (values.BidAmount*1e18) : values.BidAmount;
        let sendPrice = (values.PriceUnit === "ETH") ? (values.SendAmount*1e18) : values.SendAmount;
        let startPrice = this.props.dataArray[0].originPrice;
        //startPrice 与 bidPrice 的单位都是 wei
        console.log("起拍价 : " + startPrice + ", 竞拍价 : " + bidPrice);
        if(bidPrice < startPrice){
            message.error("竞拍价低于起拍价", 2);
            return;
        }
        let blockChainID = this.props.dataArray[0].ID;
        console.log("竞拍商品ID : " + blockChainID);

        let web3 = this.props.web3;

        //注意这里的解析方式应和合约代码中的对应
        // let sealedBid = web3.utils.keccak256(web3.utils.toWei(string(amount), 'ether'));
        //这里传给toWei的第一个参数不要求是字符串类型的，与truffle中使用toWei不同
        console.log("传给keccak256的参数是 " + ("" + bidPrice) + values.BidSecret);
        //信息加密
        let sealedBid = web3.utils.keccak256(("" + bidPrice) + values.BidSecret).toString('hex');
        console.log("用 keccak256 加密之后 sealedBid = " + sealedBid);

        //竞价信息上链

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
                await i.bid(parseInt(blockChainID), sealedBid, { from: currentAccount.toString(), value: sendPrice}).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("竞价提交成功");
                    console.log("成功调用合约的bid方法，返回 : ");
                    console.dir(res);
                    //关闭侧边栏
                    this.onClose();
                    openNotification("竞价提交成功",
                                    "您的报价: " + values.BidAmount + values.PriceUnit + ", 您的押金: " + values.SendAmount + values.PriceUnit + ", 距离揭示报价 " + this.props.dataArray[0].processTime ,
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
    
    render () {
        return (


            <div>

                <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                参与竞拍
                </Button>

            <Drawer
          title="出示您的报价"
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
            <p>起拍价: <b>{this.props.startPrice}</b></p>
            <Divider />
          <Form 
            layout="vertical" hideRequiredMark
            onFinish={this.onFinishBid}
            onFinishFailed={this.onFinishFailedBid}
            
          >
            <Form.Item
                name="BidAmount"
                label="竞拍价格"
                rules={[
                        {
                            required: true,
                            message: '请输入竞拍价格',
                        },
                ]}
            >
            <InputNumber
                min={0}
                placeholder="竞拍价格不低于起拍价"
                addonAfter={suffixSelector}
                style={{
                    width: '100%',
                }}
            />
            </Form.Item>
            <Form.Item
                name="SendAmount"
                label="竞拍押金"
                rules={[
                        {
                            required: true,
                            message: '请输入竞拍押金',
                        },
                ]}
            >
            <InputNumber
                min={0}
                placeholder="竞拍押金不低于您出示的竞拍价格"
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
                            message: '请输入加密口令',
                        },
                ]}
            >
                <Input.Password
                placeholder="在之后的揭示报价环节中使用的加密口令"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
            </Form.Item>
            <Form.Item>
                <Button 
                //这里不需要 onClick，不然会使函数 onFinishBid 收到参数 SyntheticBaseEvent
                // onClick={this.onFinishBid}
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

export default Bid;
