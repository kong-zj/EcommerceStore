import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select, Tag } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";
//价格格式化
import handlePrice from '../../../utils/handlePrice';



class HighestBidderInfo extends Component {

    state = {
        highestBidderExist : false,
        address : "0x0",
        price : "price"

    }

    componentDidMount = async () => {
        console.log("生成HighestBidderInfo模块");
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
                //调用合约的 highestBidderInfo 方法
                await i.highestBidderInfo(parseInt(blockChainID)).then(info => {
                    console.log("成功调用合约的highestBidderInfo方法，返回 : ");
                    console.dir(info);
                    let highestBidderString = "";
                    if (info[2].toLocaleString() != '0') {
                        //有人揭示报价
                        this.setState({
                            highestBidderExist : true,
                            address : info[0],
                            price : handlePrice(info[2]),
                        })
                    } 
                    else {
                        //没有人揭示报价
                        //直接进入转卖阶段
                        this.props.resellProcess();
                    }
                    message.success("查询最高竞价人信息成功",2);
                    
                });
            }catch(err) {
                message.error("查询最高竞价人信息失败",2);
                console.log("调用合约的highestBidderInfo方法失败 " + err);
                return;
            }  
        });
    }
   

 
    
    render () {
        return (
        <div>

            <div>
          {
            this.state.highestBidderExist?(
                <div>
                <p>最高出价人<Tag>{this.state.address}</Tag></p> 
                <p>成交价<Tag>{this.state.price}</Tag></p> 
                <p></p>
                </div>
            ):
            <div>
            <p>拍卖结束，没有人揭示报价</p>
                <p></p>
            </div>
        }
            </div>
                 
        </div>   

        );
    }
}

export default HighestBidderInfo;
