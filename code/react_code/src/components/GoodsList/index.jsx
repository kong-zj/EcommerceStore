import React, {Component} from "react";
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
// import './index.css';
import { List, Avatar, Space, message, Tag } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, FieldTimeOutlined, StrikethroughOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import cookie from 'react-cookies';
import {Link} from "react-router-dom";

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);



class GoodsList extends Component {
  state = {
    dataArray : []
  }

  //////////////////////重要
  //this.props.productArray 为 promise
  //promise需要解析才能使用
  //要用.then拿promise的结果

  // addressString: "河北, 石家庄市"
  // blockchainId: 3
  // category: "艺术品,古董"
  // descString: "额访问为"
  // imageUrl: "http://localhost:8080/ipfs/Qma4Cm8m52QogsfMkZ3SE6dD1rrtcRqEs1zJ69BJT6kFoW"
  // inStockNum: 22
  // key: 9
  // name: "新的"
  // price: "22 ETH"
  // shippingTime: 3
  

  constructor (props) {
    super(props);
  }

  //用来测试的模拟数据
  // productListData = [];


  //应该在调用 GoodsList 的函数中，将数据格式化好，在 GoodsList 中将传入的promise，用then解析出res，直接将数据放入 render，让 render 自动刷新
  //传入的是 Promise 的嵌套，所以要用 then 嵌套地解析两次
  componentWillMount  = () => {

    // console.log("promise.then 前拿取的信息为 : ");
    //这里输出一个 Promise
    // console.dir(this.props.productArray);

    this.props.productArray.then( res =>{

      // console.log("promise.then 后拿取的信息为 : ");
      //这里输出多个 Promise, 一个 Product 就是一个 Promise
      // console.dir(res);

      //解析每个Promise
      let resLen = res.length;
      for(let promiseIndex = 0; promiseIndex < resLen; promiseIndex++){
        res[promiseIndex].then(productInfo => {

        console.log("其中一个要渲染的信息为 : ");
        console.dir(productInfo);
          //得到每一个商品
          //向 state 中的 dataArray 添加元素的方法
          this.setState({dataArray : [...this.state.dataArray, productInfo]});
        })
      }

    }).catch( err =>{
      message.error("获得产品信息失败", 2);
      console.log("产品展示列表不能获得产品信息" + err);
    })
    

    //模拟数据，用来测试
    // for (let i = 0; i < 2; i++) {
    //   this.productListData.push({
    //     href: 'https://ant.design',
    //     name: '商品名称',
    //     avatar: 'https://joeschmoe.io/api/v1/random',
    //     category:
    //       '商品类型',
    //     descString:
    //       '商品介绍',
    //     price:
    //       '1 ETH',
    //     processTime:
    //       '时间',
    //     productCondition:
    //       '全新',
    //   });
    // }

  }
              

    render () {

      console.log("GoodsList 进行了一次渲染");

        return (
            <List
    itemLayout="vertical"
    size="large"
    pagination={{
      onChange: page => {
        console.log(page);
      },
      pageSize: 5,
    }}
    dataSource={this.state.dataArray}
    footer={
      <div>
        共 {this.state.dataArray.length} 个
      </div>
    }
    renderItem={item => (
      <List.Item
        key={item.index}
        actions={[
          <IconText icon={StrikethroughOutlined} text={item.price} key="list-vertical-star-o" />,
          <IconText icon={ShoppingCartOutlined} text={"剩余" + item.inStockNum + "件"} key="list-vertical-like-o" />,
          <IconText icon={FieldTimeOutlined} text={"发货时效" + item.shippingTime + "天"} key="list-vertical-message" />,
        ]}
        extra={
          <img
            width={130}
            height={130}
            alt="商品图片"
            src={item.imageUrl}
          />
        }
        
      >
        <List.Item.Meta

          title={<Link onClick={() => cookie.save('searchGoodsID', item.blockchainId, {path:'/'})} to={{pathname:'/index/goodsInfo'}}>{item.name}</Link>}
          description={
            <>
              <Tag>ID: {item.blockchainId}</Tag>
              <Tag>{item.category}</Tag>
              <Tag>{item.addressString}</Tag>
              <Tag>区块链存证技术</Tag>
            </>
          }
        />
        {item.descString}
      </List.Item>
    )}
    />
        );
    }
}

export default GoodsList;