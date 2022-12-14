import React, {Component} from 'react';
import {Typography, Breadcrumb, Button, Layout, Menu} from 'antd';
import TotalChart from "../TotalChart";
import Footer from "../../components/Footer";
import LeftMenu from "../../components/LeftMenu";
import PersonalInfo from "../UserOrAccount/PersonalInfo";
import AlterPwd from "../UserOrAccount/AlterPwd";

//市场
import AuctionInto from "../Market/AuctionInto";
import Shopping from "../Market/Shopping";
import ProductInfo from "../Market/ProductInfo";
import GoodsInfo from "../Market/GoodsInfo";
//发布
import AuctionOut from "../Publish/AuctionOut";
import Selling from "../Publish/Selling";

import HelpInfo from '../HelpInfo/index.jsx';

import './index.css'
import cookie from "react-cookies";
import {Route, Switch} from "react-router-dom";
// import { ContactsOutlined } from "@ant-design/icons";


//antd中的组件
const { Header, Content } = Layout;
const { Title } = Typography;




export default class Index extends Component {

    state = {//当前页面
            currentPage:"",
            username:cookie.load('username'),
            //WebSocket
            ws:null,

            // //性能优化，放到 LeftMenu 中，减少传参的次数
            // web3:null,
            // //当前合约
            // currentContract:null
        }

    //是否需要登录
    constructor (props) {
        super (props);
        const username = cookie.load('username');
        //防止输入URL直接进入主页
        if(username === undefined) {
            window.location.href = '/login'
        }
    }

    //用户退出
    handleLoginOut = () => {
        //清除cookie
        cookie.remove('username', { path: '/' })
        cookie.remove('loginSuccess', { path: '/' })
        cookie.remove('webSocket', {path:'/'})
        cookie.remove('email', {path:'/'})

        const ws = this.state.ws;
        //关闭连接
        if(ws !== null) ws.close();
        window.location.href = '/login';
    }

    //切换当前页面信息(用于顶部导航显示)
    //作为参数传入 LeftMenu
    //接收子组件到父组件的反向数据流
    changePage = name => {
        this.setState({currentPage:name});
    }

    //转到 PersonalInfo 处理，懒加载
    // //拿个人信息(name, email, account)
    // getMyInfo = () => {
    //     axios.post("/getPersonalInfo", {
    //         username:this.state.username
    //     }).then(response => {
    //         const data =  response.data;
    //         if(data.code === "success"){
    //             let array = data.accountArray.map((item, index) => {
    //                 return {
    //                     accountName: item.accountName,
    //                 }
    //             });

    //             // cookie.save('accountArray', array, {path:'/'});
    //         }
    //         else{
    //             message.warning ("获取个人信息出错").then (r  => console.log(r));
    //         }
    //     }).catch( err => {
    //         console.log("拿取个人信息出错， ERR : " + err);
    //     })
    // }

    
    componentDidMount () {
        console.log("生成首页");
        console.log("当前页面 : "+this.state.currentPage);
        // //将 getBlockChainInfo 推迟到 LeftMenu 中

        

        //从后端获取商品总体信息

        // try {
        //     this.getMyDevice();
        // }catch (err){
        //     console.log("获得商品信息失败");
        // }
        // console.log("成功获得商品信息");
        
        
        // 连接后端 app.js 中的 ws

        // const webSocket = cookie.load('webSocket');
        // if(webSocket === undefined){
        //     // 打开一个 web socket  这里端口号和监听的需一致
        //     const ws = new WebSocket ('ws://localhost:4000');
        //     ws.onopen = function(e){
        //         console.log("连接服务器成功");
        //         ws.send('hello');
        //         // 向服务器发送消息
        //         ws.send("test");
        //     }
        //     ws.onclose = (e) => {
        //         this.setState({ws:null});
        //         cookie.remove('webSocket');
        //         console.log('websocket连接关闭')
        //     }
        //     // 这里接受服务器端发过来的消息
        //     ws.onmessage = function(e) {
        //         console.log(e.data);
        //         const array = cookie.load('deviceArray');
        //         if(e.data.indexOf("上线") !== -1){
        //             array.forEach(item => {
        //                 if(e.data.indexOf(item.deviceID) !== -1){
        //                     const str = e.data.replace(item.deviceID, "");
        //                     message.success( str, 10)
        //                         .then(value => console.log(value), reason => console.log(reason))
        //                 }
        //             })
        //         }
        //         else{
        //             array.forEach(item => {
        //                 if(e.data.indexOf(item.deviceID) !== -1){
        //                     const str = e.data.replace(item.deviceID, "");
        //                     message.warning( str, 10)
        //                         .then(value => console.log(value), reason => console.log(reason))
        //                 }
        //             })
        //         }
        //     }
        //     this.setState({ws:ws});
        //     // cookie.save('webSocket', true, {path:'/'});
        //     cookie.save('webSocket', ws, {path:'/'});
        // }

    }

    render () {
        return (
            <div>
            <Layout>
                <Header className="header">
                    <Menu theme="dark" mode="horizontal" id="banner">
                        <div id="myTitle"><Title style={{color:"white"}} level={3}>区块链溯源电子商务平台</Title></div>
                        {/* <p style={{ float:"left", margin:"0px", padding:"0px"}}>11111111111111111111111111111</p> */}
                        <Button type="primary" id="exitBtn" onClick = {this.handleLoginOut}>退出登录</Button>
                    </Menu>
                </Header>
                <Layout>
                    <LeftMenu changePag={this.changePage}/>
                    <Layout style={{ padding: '0 24px 24px', position:'relative' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>首页</Breadcrumb.Item>
                            <Breadcrumb.Item>{this.state.currentPage}</Breadcrumb.Item>
                        </Breadcrumb>
                        
                        
                        <Content
                            className="site-layout-background"
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: "90vh",
                            }}
                        >
                            <Switch>
                                <Route exact path={"/index"} component={TotalChart}/>
                                <Route exact path={"/index/personalInfo"} component={PersonalInfo}/>
                                <Route exact path={"/index/alterPwd"} component={AlterPwd}/>

                                <Route exact path={"/index/auctionInto"} component={AuctionInto}/>
                                <Route exact path={"/index/shopping"} component={Shopping}/>
                                <Route exact path={"/index/productInfo"} component={ProductInfo}/>
                                <Route exact path={"/index/goodsInfo"} component={GoodsInfo}/>

                                <Route exact path={"/index/auctionOut"} component={AuctionOut}/>
                                <Route exact path={"/index/selling"} component={Selling}/>

                                <Route exact path={"/index/helpInfo"} component={HelpInfo}/>
                            </Switch>
                            <Footer/>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>

            </div>
        );
    }
}