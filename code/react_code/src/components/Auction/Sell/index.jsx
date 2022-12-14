import React, {Component} from "react";
import { Menu, Layout, message, Drawer, Space, Button, Divider, Form, InputNumber, Input, Select, List, Avatar, Skeleton } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, EyeTwoTone, EyeInvisibleOutlined, RocketOutlined } from '@ant-design/icons';
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../../utils/getWeb3";
import getEcommerceStore from "../../../utils/getEcommerceStore";
import openNotification from "../../Notification";

const { Option } = Select;

const count = 6;


class Sell extends Component {

    state = {
        visible: false,
        //list
        loading: false,
        list: [],
    }

    constructor (props) {
        super (props);
    }

        //格式化商品信息，为渲染界面做准备
      formatOrderInfo = async(originInfo) => {



          let afterInfo = originInfo[0].map((item, index) => {
            if(false == originInfo[2][index]){
              return {
                //key从0开始
                key: index,
                buyer: item,
                sum: parseInt(originInfo[1][index]),
              }
            }
            
          });
          //去除空元素
          afterInfo = afterInfo.filter(this.checkNotNull);
     
          return afterInfo;
      }

      //去除空元素
      checkNotNull = (item) => {
        return item!=null;
    }

      


    async componentDidMount () {
        console.log("生成Sell模块");

        //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
        //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
        let that = this;
        this.props.truffleContract.deployed().then( async (i) => {
            console.log("获取订单信息 调用合约的函数");
            try{
                //即时获取当前地址，用该地址发交易
                let currentAccount = await that.props.web3.eth.getAccounts();

                //ID
                let blockChainID = this.props.dataArray[0].ID;

                i.orderInfo(blockChainID, { from: currentAccount.toString()}).then(async res => {
                    //可能返回为空，要判断是否真的取到了数据，如果不判断，直接调用 formatProductInfo(res)，里面的 ipfs 会报错
                    console.log("orderInfo 取到的原始数据为 : ");
                    console.dir(res);

                    // 0: (3) ['0xaB16f539d0935C81bfd3fe6c2354D111e859cA53',...]
                    // 1: (3) [BN, BN, BN]
                    // 2: (3) [false, false, false]

                    //格式化数据，便于显示
                    let OrderArrayInfo = await this.formatOrderInfo(res);
                    console.log("格式化之后的数据 OrderArrayInfo 为 ");
                    console.dir(OrderArrayInfo);

                    this.setState({
                        list: OrderArrayInfo,
                    });
                    
                });  
            }catch(err) {
                message.error("商品订单查询失败",2);
                console.log("调用合约的orderInfo方法失败 " + err);
            }

            
        });
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

      //处理卖家发货，从合约得到买家的押金
      sellerDealOrder = (orderIndex) => {
        console.log("orderIndex为 " + orderIndex + " 的order信息被卖家处理中");

        let that = this;
        this.props.truffleContract.deployed().then( async (i) => {
          console.log("卖家发货 调用合约的函数");
          try{
              //即时获取当前地址，用该地址发交易
              let currentAccount = await that.props.web3.eth.getAccounts();

              //ID
              let blockChainID = this.props.dataArray[0].ID;

              i.sendBySeller(blockChainID, orderIndex, { from: currentAccount.toString()}).then(async res => {
                
                message.success("商品发货成功",2);
                  
              });  
          }catch(err) {
              message.error("商品发货提交失败",2);
              console.log("调用合约的sendBySeller方法失败 " + err);
          }

          
      });

      }


   
    render () {


      const { loading, list } = this.state;


        return (


          <div>

            <Button type="primary" icon={<RocketOutlined />} size={"large"} onClick={this.showDrawer}>
                发货
            </Button>

            <Drawer
          title="发货"
          width={600}
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

          <List
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={list}
        renderItem={item => (
          <List.Item
            actions={[<a onClick={(e) => this.sellerDealOrder(item.key)} key="list-loadmore-more">确认</a>]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                title={<p>买家: {item.buyer}</p>}
                description={<p>{item.sum} 件</p>}
              />
              <div></div>
            </Skeleton>
          </List.Item>
        )}
      />


        </Drawer>

            </div>

            
        );
    }
}

export default Sell;
