import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select, Tag } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";


//this.props.showButton用于在资金处理中，显示处理资金的按钮

class EscrowInfo extends Component {

    state = {
        seller : "NULL",
        buyer : "NULL",
        arbiter : "NULL",
        release : -1,
        refund : -1,
        //资金转走为 true
        fundsDisbursed : false,
    }

    componentDidMount = () => {
        console.log("生成EscrowInfo模块");
        this.getInfoFromBlockchain();
    }

    getInfoFromBlockchain = () => {
        let blockChainID = this.props.dataArray[0].ID;
        console.log("竞拍商品ID : " + blockChainID);

        let that = this;
        this.props.truffleContract.deployed().then(async (i) => {
            console.log("进入 this.props.truffleContract.deployed() 的回调函数");
            //测试时要在MetaMask中选中ganache提供的10个地址之一，from自己创建的地址会失败
            //即时获取当前地址，用该地址发交易
            let currentAccount = await that.props.web3.eth.getAccounts();
            console.log("交易发起地址为: "+currentAccount);

            try{
                //调用合约的 escrowInfo 方法
                await i.escrowInfo(parseInt(blockChainID), { from: currentAccount.toString() }).then(async info => {
                    console.log("成功调用合约的escrowInfo方法，返回 : ");
                    console.dir(info);

                    this.setState({
                        seller : info[0],
                        buyer : info[1],
                        arbiter : info[2],
                        release : parseInt(info[4]),
                        refund  : parseInt(info[5]),
                    })

                    //合约中的钱已被转走
                    if(info[3] == true){
                        this.setState({
                            fundsDisbursed : true,
                        })
                        //禁用 release 和 refund 按钮
                        this.props.offButton();
                        console.log("禁用投票按钮");

                        //启用转卖按钮
                        let releaseCount = parseInt(info[4]);
                        let refundCount  = parseInt(info[5]);
                        //product已给买家
                        if(releaseCount >= 2 && refundCount <= 1){
                            //当前地址是买家
                            if(currentAccount == info[1]){
                                this.props.showResell();
                            }
                        }
                        //product还在卖家
                        else if(releaseCount <= 1 && refundCount >= 2){
                            //当前地址是卖家
                            if(currentAccount == info[0]){
                                this.props.showResell();
                            }
                        }
                    }
                    //钱还在合约中
                    else{
                        //看是否是当前地址，控制一些信息只对相关的人展示
                        if(currentAccount == info[0] || currentAccount == info[1] || currentAccount == info[2]){
                            //启用 release 和 refund 按钮
                            this.props.showButton();
                            console.log("启用投票按钮");
                        }
                        this.setState({
                            fundsDisbursed : false,
                        })
                    }

                    

                    message.success("查询最终资金处理信息成功",2);
                });
            }catch(err) {
                message.error("查询最终资金处理信息失败",2);
                console.log("调用合约的escrowInfo方法失败 " + err);
                return;
            }  
        });
    }
   

 
    
    render () {
        return (

            <div>
                <p></p>
                <p>卖家 <Tag>{this.state.seller}</Tag></p>
                <p>买家 <Tag>{this.state.buyer}</Tag></p>
                <p>仲裁人 <Tag>{this.state.arbiter}</Tag> </p>

                <p>放款  <b>{this.state.release}</b> / 3 人同意</p>
                <p>退款  <b>{this.state.refund}</b> / 3 人同意</p>

                <div>
          {
            this.state.fundsDisbursed?(
                <div>
                <p>资金已从合约中转出</p>
                </div>
            ):
            <div>

            </div>
        }
            </div>


                

            </div>

        );
    }
}

export default EscrowInfo;
