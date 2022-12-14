import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Typography, Form, InputNumber, Input, Select, Tag } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3

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


class Finalize extends Component {

    state = {
        visible: false
    }

    constructor (props) {
        super (props);
    }


    async componentDidMount () {
        console.log("生成Finalize模块");
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
    onFinishFinalize = (values) => {
        console.log("申请成为仲裁人按钮被点击，onFinishFinalize 得到的数据为 : ");
        console.dir(values);
        //values 中的数据示意
        // PriceUnit: "ETH"
        // ArbiterAmount: 6

        if(values.PriceUnit === undefined){
          message.error("请指定价格单位");
          return;
      }

        if(this.props.dataArray.length === 0){
            message.error("找不到正在竞拍的商品");
            return;
        }

        let web3 = this.props.web3;
        //处理价格，把单位转为 wei
        let arbiterPrice = -1;
        if(values.PriceUnit === "ETH"){
          arbiterPrice = web3.utils.toWei(values.ArbiterAmount.toString(), 'ether');
        }else if(values.PriceUnit === "wei"){
          arbiterPrice = parseInt(values.ArbiterAmount);
        }

        let blockChainID = this.props.dataArray[0].ID;
        console.log("竞拍商品ID : " + blockChainID + "仲裁押金 : " + arbiterPrice + " wei");


        //仲裁人信息上链 和 支付押金
        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await web3.eth.getAccounts();
            message.info("交易发起地址为: "+currentAccount, 2);
            console.log("交易发起地址为: "+currentAccount);

            try{

                //调用合约的 finalizeAuction 方法
                await i.finalizeAuction(parseInt(blockChainID), { from: currentAccount.toString(),  value: arbiterPrice }).then(res => {
                    //注意这里调用合约方法使用的地址，必须是字符串形式，要用 toString() 转化为字符串
                    message.success("仲裁人申请成功");
                    console.log("成功调用合约的finalizeAuction方法，返回 : ");
                    console.dir(res);

                    

                    //关闭侧边栏
                    this.onClose();
                    openNotification("仲裁人申请成功",
                                    "当买家与卖家发生交易纠纷时, 您可介入, 进行仲裁" ,
                                    'bottomLeft');
                    
                    //刷新显示的product信息
                    this.props.onFinish();
                });

                // 新版本使用 合约调用合约的形式，避免多次使用钱包转账gas，体验更好
                //废弃
                // that.props.tracingContract.deployed().then(async (i) =>{
                //     try{
                //       await i.addOneLineToInfoLine(1, blockChainID, "成为仲裁人", moment(Date()).format('yy年M月D日, h:mm:ss a'), { from: currentAccount.toString() }).then(res =>{
                //         console.log("成功添加成为仲裁人的溯源信息，返回 : ");
                //         console.dir(res);
                //       })
                //     }catch(err){
                //       message.error("添加仲裁人溯源信息失败",2);
                //       console.log("调用溯源合约的addOneLineToInfoLine方法失败 " + err);
                //       return;
                //     }
                // })

            }catch(err) {
                message.error("申请成为仲裁人失败, 买家和卖家不能申请当仲裁人, 任意的第三者可以",2);
                console.log("调用合约的finalizeAuction方法失败 ");
                console.dir(err);
                return;
            }  

          //   try{
          //     //调用合约的 highestBidderInfo 方法
          //     await i.highestBidderInfo(parseInt(blockChainID)).then(info => {
          //         console.log("成功调用合约的highestBidderInfo方法，返回 : ");
          //         console.dir(info);
          //         let highestBidderString = "";
          //         if (info[2].toLocaleString() == '0') {
          //             //没有人揭示报价
          //             highestBidderString = "拍卖结束，没有人揭示报价";
          //         } else {
          //             //有人出价
          //             highestBidderString = "拍卖结束，最高出价竞拍人 (" + info[0] + ") 以次高价格 (" + handlePrice(info[2]) + ") 赢得竞拍";
          //         }

          //       // 新版本使用 合约调用合约的形式，避免多次使用钱包转账gas，体验更好
          //       //废弃
          //       // that.props.tracingContract.deployed().then(async (i) =>{
          //       //     try{
          //       //       await i.addOneLineToInfoLine(1, blockChainID, highestBidderString, moment(Date()).format('yy年M月D日, h:mm:ss a'), { from: currentAccount.toString() }).then(res =>{
          //       //         console.log("成功添加最高出价者的溯源信息，返回 : ");
          //       //         console.dir(res);
          //       //       })
          //       //     }catch(err){
          //       //       message.error("添加仲裁人溯源信息失败",2);
          //       //       console.log("调用溯源合约的addOneLineToInfoLine方法失败 " + err);
          //       //       return;
          //       //     }
          //       // })


                  
          //     });
          // }catch(err) {
          //     message.error("查询最高竞价人信息失败",2);
          //     console.log("调用合约的highestBidderInfo方法失败 " + err);
          //     return;
          // }  
        });

    }


    //点击提交竞拍按钮，表单不能提交时
    onFinishFailedFinalize = (errorInfo) => {
        message.warning("请正确填写信息",2);
    }

   

 
    
    render () {
        const { Paragraph } = Typography;
        return (
          

          <div>

                          <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                申请成为仲裁人
            </Button>

            <Drawer
          title="申请成为仲裁人"
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
            onFinish={this.onFinishFinalize}
            onFinishFailed={this.onFinishFailedFinalize}
            
          >
            <Form.Item
                name="ArbiterAmount"
                label="仲裁押金"
                rules={[
                        {
                            required: true,
                            message: '请输入仲裁押金',
                        },
                ]}
            >
            <InputNumber
                min={0}
                placeholder="当买家与卖家的交易完成后全额返还"
                addonAfter={suffixSelector}
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
            <Paragraph >
            <p> </p>
            </Paragraph>
            <Paragraph >
            <blockquote> <p>当买家与卖家交易成功时，您会得到</p> <p><Tag>1% 买卖双方交易额</Tag>与<Tag>10% 仲裁押金</Tag></p> <p>中的<Tag>较小者</Tag>作为报酬</p></blockquote> 
            </Paragraph>

          </Form>
        </Drawer>

            </div>

          

            
        );
    }
}

export default Finalize;
