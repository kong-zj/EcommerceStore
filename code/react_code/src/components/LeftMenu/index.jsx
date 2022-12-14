import React, {Component} from "react";
import { Menu, Layout, message } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined, UploadOutlined, AppstoreOutlined } from '@ant-design/icons';
import {Link} from "react-router-dom";
import axios from "axios";
import cookie from "react-cookies";
//接入web3
import getWeb3 from "../../utils/getWeb3";
import getEcommerceStore from "../../utils/getEcommerceStore";

import saveAccountString from "../../utils/saveAccountString";

const { Sider } = Layout;
const { SubMenu } = Menu;



class LeftMenu extends Component {

    state = {
        username:cookie.load('username'),
        //web3 与 truffleContract 不能作为参数传递到其他路由
        //BUG
        web3 : null,
        truffleContract : null
    }

    constructor (props) {
        super (props);
        this.changePage = this.changePage.bind(this);
    }

    changePage = page =>{
        console.log("从LeftMenu到主页的反向数据流 changePage，参数为 : " + page);
        //数据向上传递
        this.props.changePag(page);
    }


    componentDidMount () {
        console.log("生成左侧边栏");
        //将 getBlockChainInfo 推迟到 LeftMenu 中
        if(this.getBlockChainInfo()){
            console.log("成功获得地址信息");
        }else{
            console.log("获得地址信息失败");
        }
    }

    //拿取 web3 实例
    getBlockChainInfo = async() => {
        try {
            //使用 await，等待上一步的结果
            // Get network provider and web3 instance. 
            //动态获取
            const web3 = await getWeb3();
            console.log("运行 getWeb3() 成功");

            // Use web3 to get the user's accounts.
            let accounts = await web3.eth.getAccounts();
            //保存用户地址到数据库
            saveAccountString(this.state.username, accounts);

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            console.log("当前 networkId 为: " + networkId);

            //由truffle生成合约实例
            //动态获取
            const EcommerceStore = await getEcommerceStore(web3);

            //不能保存在cookie里，格式不符合
            // cookie.save('web3', web3, {path:'/'});
            // cookie.save('truffleContract', EcommerceStore, {path:'/'});
            //保存在 state 里，传给 render 中包含的模块用 props 调用
            this.setState({
                web3: web3,
                currentContract:EcommerceStore
            });

            console.log("用户名 : "+this.state.username);
            console.log("LeftMenu 的 web3 : ");
            console.dir(this.state.web3);
            console.log("LeftMenu 的当前 EcommerceStore 为: ");
            console.dir(this.state.currentContract);
            message.success("接入web3成功", 2);
            return true;
  
          } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
              `[ERROR]接入web3失败.`,
            );
            console.error(error);
            return false;
          }
    }

    
    render () {
        return (
            <Sider width={200} className="site-layout-background">
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    style={{ height: '100%', borderRight: 0 }}
                    theme={'light'}
                >
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={e => this.changePage("")}><Link to={{pathname:'/index'}}>首页</Link></Menu.Item>
                    <SubMenu key="sub1" icon={<UserOutlined />} title="用户">
                        <Menu.Item key="2" onClick={e => this.changePage("地址管理")}><Link to={{pathname:'/index/personalInfo'}}>地址管理</Link></Menu.Item>
                        <Menu.Item key="3" onClick={e => this.changePage("修改密码")}><Link to={{pathname:'/index/alterPwd'}}>修改密码</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<AppstoreOutlined />} title="市场">
                        <Menu.Item key="4" onClick={e => this.changePage("购物")}><Link to={{pathname:'/index/shopping'}}>购物</Link></Menu.Item>
                        <Menu.Item key="5" onClick={e => this.changePage("拍卖")}><Link to={{pathname:'/index/auctionInto'}}>拍卖</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub5" icon={<FileSearchOutlined />} title="查询">
                        <Menu.Item key="13" onClick={e => this.changePage("普通商品")}><Link to={{pathname:'/index/goodsInfo'}}>普通商品</Link></Menu.Item>
                        <Menu.Item key="12" onClick={e => this.changePage("拍卖商品")}><Link to={{pathname:'/index/productInfo'}}>拍卖商品</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" icon={<UploadOutlined />} title="发布">
                        <Menu.Item key="6" onClick={e => this.changePage("出售")}><Link to={{pathname:'/index/selling'}}>出售</Link></Menu.Item>
                        <Menu.Item key="7" onClick={e => this.changePage("拍卖")}><Link to={{pathname:'/index/auctionOut'}}>拍卖</Link></Menu.Item>
                    </SubMenu>
                    {/* <SubMenu key="sub4" icon={<UserOutlined />} title="溯源">
                        <Menu.Item key="8" onClick={e => this.changePage("信息上链")}><Link to={{pathname:'/index/uploadInfo'}}>信息上链</Link></Menu.Item>
                        <Menu.Item key="9" onClick={e => this.changePage("追踪溯源")}><Link to={{pathname:'/index/downloadInfo'}}>追踪溯源</Link></Menu.Item>
                    </SubMenu> */}
                    <Menu.Item key="10" icon={<LaptopOutlined />} onClick={e => this.changePage("帮助")}><Link to={{pathname:'/index/helpInfo'}}>帮助</Link></Menu.Item>
                </Menu>
            </Sider>
        );
    }
}

export default LeftMenu;
