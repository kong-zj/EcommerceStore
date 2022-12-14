import React, {Component} from "react";
import { message, Tag, Timeline } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import moment from "moment";
//接入web3
// import getWeb3 from "../../../utils/getWeb3";
// import getEcommerceStore from "../../../utils/getEcommerceStore";

class Tracing extends Component {

    state = {
      //存储该商品的溯源时间轴数据
      publisher:[],
      //描述语句的IPFS解析链接
      descLink:[],
      //发生时间
      exeTimeString:[]
    }

    // 父组件传入
    // web3={this.state.web3}
    // tracingContract={this.state.tracingContract}
    // class={1}
    // id={productData.ID}

    constructor (props) {
        super (props);
    }


    async componentDidMount () {
          console.log("生成Tracing模块");
          //从区块链拿数据
          this.renderTracingDetails();      
    }


      //调用区块链方法，得到该商品的溯源信息
    renderTracingDetails = () => {

      if(this.props.tracingContract === null || this.props.web3 === null){
          message.error("连接溯源合约失败",2);
          console.log("[ERROR]web3 或者 tracingContract 为 null");
          return;
      }

      console.log("用来查询的信息 : ");
      console.log("class : " + this.props.class);
      console.log("id : " + this.props.id);

      console.log("合约为 : ");
      console.dir(this.props.tracingContract);
      
  
      //注意回调函数中的this，和外界的this不同，如果向使用外界的this，要赋值成that传过去
      //注意要使用async，确保先拿到地址，用await关键字确保运行的先后顺序，再用这个地址调用合约方法
      let that = this;

      // this.props.tracingContract.deployed().then( (i) => {
      //     console.log("进入 this.props.tracingContract.deployed() 的回调函数");
      //     try{
      //         i.getInfoLine(this.props.class, this.props.id).then(res => {
      //             //可能返回为空，要判断是否真的取到了数据，如果不判断，直接调用，可能出错
      //             console.log("getInfoLine 取到的原始数据为 : ");
      //             console.dir(res);
                

      //             this.setState({
      //                 Lines : res
      //             })

      //             console.log("this.state.Lines : ");
      //             console.dir(this.state.Lines);
                  
      //         });  
      //     }catch(err) {
      //         message.error("商品溯源失败",2);
      //         console.log("调用合约的getInfoLine方法失败 " + err);
      //     }

          
      // });

      this.props.truffleContract.deployed().then( (i) => {
        console.log("进入 this.props.truffleContract.deployed() 的回调函数");
        try{
            console.log("try getTracingInfo");
            i.getTracingInfo(this.props.id).then(res => {
                //可能返回为空，要判断是否真的取到了数据，如果不判断，直接调用，可能出错
                console.log("getInfoLine 取到的原始数据为 : ");
                console.dir(res);
              

                this.setState({
                  publisher:res[0],
                  descLink:res[1],
                  exeTimeString:res[2]
                })

                console.log("this.state.Lines : ");
                console.dir(this.state.Lines);
                
            });  
        }catch(err) {
            message.error("商品溯源失败",2);
            console.log("调用合约的getInfoLine方法失败 " + err);
        }

        
    });
  }

  
    


    
    render () {
        return (


            <div>

<Timeline pending="关键事件持续监控中">
            <div>
                {this.state.publisher.map((item,i)=>{
                    {
                      // 0, 1, 2, 3
                      //blue、red、green、gray
                      let iM4=i%4;
                      var colorString = iM4==0 ? "blue" : (iM4==1 ? "red" : (iM4==2 ? "green" : "gray"));
                    }
                    // //item中的信息(数组形式)
                    // // 信息发布人
                    // // 描述语句的IPFS解析链接
                    // // 发生时间

                    // return <Timeline.Item color={colorString}>
                    //   <p>{item[1]}</p>
                    //   <p>创建于 {item[2]}</p>
                    //   <p>来自 {item[0]}</p>
                    //    </Timeline.Item>

                    //item中的信息只有publisher, 另外两个信息用i索引

                    return <Timeline.Item color={colorString}>
                      <p>{this.state.descLink[i]}</p>
                      <p>区块时间戳 <Tag>{moment(this.state.exeTimeString[i]).format('yy年M月D日, h:mm:ss a')}</Tag></p>
                      <p>来自地址 <Tag>{item}</Tag></p>
                       </Timeline.Item>
                })}
            </div>
    
  </Timeline>

            </div>
        );
    }
}

export default Tracing;
