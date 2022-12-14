import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";
import moment from "moment";

const { Option } = Select;


class ReleaseFunds extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }

    async componentDidMount () {
        console.log("生成ReleaseFunds模块");
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
    onFinishReleaseFunds = (values) => {
        console.log("申请成为仲裁人按钮被点击，onFinishReleaseFunds 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意

        if(this.props.dataArray.length === 0){
            message.error("找不到的商品");
            return;
        }

        let blockChainID = this.props.dataArray[0].ID;
        console.log("竞拍商品ID : " + blockChainID);

        //仲裁人信息上链
        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await that.props.web3.eth.getAccounts();
            message.info("交易发起地址为: "+currentAccount, 2);
            console.log("交易发起地址为: "+currentAccount);

            try{
                //调用合约的 releaseAmountToSeller 方法
                await i.releaseAmountToSeller(parseInt(blockChainID), { from: currentAccount.toString() }).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("提交放款申请成功");
                    console.log("成功调用合约的releaseAmountToSeller方法，返回 : ");
                    console.dir(res);
                    //关闭侧边栏
                    this.onClose();
                    openNotification("提交放款申请成功",
                                    "三个人(卖家, 买家, 仲裁人)中的两人意见达成一致时, 会触发智能合约, 进行放款或退款的操作" ,
                                    'bottomLeft');

                          //换用新版本
                          //废弃
                          // that.props.tracingContract.deployed().then(async (i) =>{
                          //     try{
                          //         await i.addOneLineToInfoLine(1, blockChainID, "同意释放资金给卖家", moment(Date()).format('yy年M月D日, h:mm:ss a'), { from: currentAccount.toString() }).then(res =>{
                          //         console.log("成功添加释放资金的溯源信息，返回 : ");
                          //         console.dir(res);
                          //       })
                          //     }catch(err){
                          //       message.error("添加释放资金溯源信息失败",2);
                          //       console.log("调用溯源合约的addOneLineToInfoLine方法失败 " + err);
                          //       return;
                          //     }
                          // })                    
                });
            }catch(err) {
                message.error("提交放款申请失败, 如果你不是(卖家, 买家, 仲裁人)三者之一, 这个操作对你来说是无效的",2);
                console.log("调用合约的releaseAmountToSeller方法失败 ");
                console.dir(err);
                return;
            }  
        });

    }


    //点击提交竞拍按钮，表单不能提交时
    onFinishFailedReleaseFunds = (errorInfo) => {
        message.warning("请正确填写信息",2);
    }

   

 
    
    render () {
        return (

          <div>

                          <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                释放资金给卖家
            </Button>

            <Drawer
          title="释放资金给卖家"
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
            <p>请确认您是 (卖家, 买家, 仲裁人) 三者之一</p>
            <Divider />
          <Form 
            layout="vertical" hideRequiredMark
            onFinish={this.onFinishReleaseFunds}
            onFinishFailed={this.onFinishFailedReleaseFunds}
            
          >
            <Form.Item>
                <Button 
                type="primary" 
                htmlType="submit"
                disabled={ this.props.truffleContract === null || this.props.web3 === null } 
                >
                确定
              </Button>
            </Form.Item>

          </Form>
        </Drawer>

            </div>

        );
    }
}

export default ReleaseFunds;
