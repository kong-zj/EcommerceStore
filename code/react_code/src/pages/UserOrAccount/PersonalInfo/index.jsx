import React, {Component} from 'react';
import {Descriptions, message, Button} from 'antd';
import axios from "axios";
import cookie from "react-cookies";
import { Table, Tag } from 'antd';
import {Link} from "react-router-dom";
import timeDuration from "../../../utils/timeDuration";
import moment from 'moment';


class PersonalInfo extends Component {

    state = {
        username:cookie.load('username'),
        email:cookie.load('email'),
        accountAndLastTimeArray: [],
        //记录被选中的地址
        //selectedRowKeys 中的索引下标对应 accountAndLastTimeArray 中的key值，但比index大1，注意拿数据时是用index拿的
        selectedRowKeys: [], 
        //删除操作进行中
        loading: false
        }
    columns = [
        // {
        //     title: '设备ID',
        //     dataIndex: 'deviceID',
        //     key: 'id',
        //     render: text => <Link to={{pathname:'/index/editDevice', state:{deviceID:text}}} >{text}</Link>,
        // },
        {
            title: '地址',
            dataIndex: 'accountString',
            key: 'accountString',
        },
        {
            title: '最后上线时间',
            dataIndex: 'lastTime',
            key: 'lastTime',
        },
        {
            title: '状态',
            key: 'accountStatus',
            dataIndex: 'accountStatus',
            render: tag => <Tag color={tag === 0 ? 'red' : 'green'} key={tag}>{tag === 0 ? '非活跃' : '活跃'}</Tag>
        }
    ];

    
    //数据库操作和清空待操作的索引，有先后关系，用同步，避免异步导致bug
    deleteAccount = async() => {
        this.setState({ loading: true });
        //判断deleteOne 还是 deleteAll
        const allNumber = this.state.accountAndLastTimeArray.length;
        const deleteNumber = this.state.selectedRowKeys.length;
        console.log("该用户总地址数为 : " + allNumber);
        console.log("用户要删除的地址数为 : " + deleteNumber);
        const isAll = (allNumber === deleteNumber) ? true : false;
        //记录数据库是否有变化
        let isChange = false;
        
        if(isAll) {
            //删除全部
            await axios.post("/account/deleteAll", {
                username:this.state.username
            }).then(response => {
                const data =  response.data;
                if(data.status === "success"){
                    isChange = true;
                    console.log("删除该用户所有曾用地址成功");
                    message.success("删除成功");
                }else{
                    console.log("删除该用户所有曾用地址出错");
                    message.error("删除失败");
                }
            }).catch( err => {
                console.log("数据库操作失败, ERR : " + err);
                message.error("接入数据库失败");
            })

        }else{
            //一个一个删
            let selectIndex;
            let isSuccess = true;
            //用这种方法遍历出的值总是从0递增，不满足需要
            // for(accountKey in this.state.selectedRowKeys) {
            for(selectIndex = 0; selectIndex < deleteNumber; selectIndex += 1) {
                let accountIndex = this.state.selectedRowKeys[selectIndex] -1;
                let accountStringWillDelete = this.state.accountAndLastTimeArray[accountIndex].accountString;
                console.log("正在删除 key = " + (accountIndex+1) + ", account = " + accountStringWillDelete);

                await axios.post("/account/deleteOne", {
                    username: this.state.username,
                    accountString: accountStringWillDelete
                }).then(response => {
                    const data =  response.data;
                    if(data.status === "success"){
                        isChange = true;
                        console.log("删除该用户的一个地址成功");
                    }else{
                        console.log("删除该用户的一个地址出错");
                        isSuccess = false;
                    }
                }).catch( err => {
                    console.log("数据库操作失败, ERR : " + err);
                    isSuccess = false;
                })
            }

            //message 显示成功或失败
            if(isSuccess){
                message.success("删除成功");
            }else{
                message.error("删除失败或接入数据库失败");
            }
        }

        //如果删除成功，数据库发生变化，别忘了更新表格
        if(isChange){
            this.componentDidMount();
        }
        
        //注意 selectedRowKeys 里保存的数据，在数据库操作完成后，才能清空，以为异步执行
        //要把异步操作转化为顺序操作
        setTimeout(async () => {
          await this.setState({
            selectedRowKeys: [],
            loading: false,
          });
        }, 1000);

    };

    onSelectChange = selectedRowKeys => {
        console.log('选中项目的编号 : ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    //accountAndLastTimeArray 的数据在 componentDidMount 格式化好后，直接传入 render
    componentDidMount () {
        const deleteSuccess = cookie.load('deleteSuccess');
        if(deleteSuccess !== undefined){
            cookie.remove('deleteSuccess', {path:'/'});
            message.success('删除地址成功',2);
        }
        console.log("向后端发起获取所有曾用地址的请求");
        axios.post("/account/showAll", {
            username:this.state.username
        }).then(response => {
            const data =  response.data;
            if(data.status === "success"){
                console.log("获取该用户所有曾用地址成功");
                //data.accountAndLastTime 是外层是数组，每个数组元素是字典类型
                //map 方法，数组映射
                let array = data.accountAndLastTime.map((item, index) => {
                    //计算时间差，判断是否活跃
                    //注意mysql返回的 timestamp 与js中的 Date 的区别，以及相互转换
                    let timeDifference = new Date() - new Date(item.lastTime);
                    console.log("这个日期距离现在已经 " + timeDuration(timeDifference));
                    //小于一天时间的是活跃账户
                    let tag = ( timeDifference> 24*60*60*1000) ? true : false;
                    return {
                        //key从1开始
                        key: index + 1,
                        accountString: item.accountString,
                        accountStatus: tag ? 0:1,
                        //moment库，格式化时间
                        lastTime: moment(item.lastTime).format('yy年M月D日, h:mm:ss a')
                    }
                });
                console.log("map映射后的要放到列表中的数据 array 为 : ");
                console.dir(array);
                this.setState({accountAndLastTimeArray:array});

            }
            else{
                console.log("获取该用户所有曾用地址出错");
                message.warning ("获取地址信息出错").then (r  => console.log(r));
            }
        }).catch( err => {
            console.log("发起获取所有曾用地址的请求失败, ERR : " + err);
        });
    }

    //第一次渲染时，数据还没处理好
    //等待数据处理好后，马上会自动重新渲染
    //数据像水一样灌进来
    render () {
        const {username, email, accountAndLastTimeArray, loading, selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div>
                <Descriptions
                    title="个人信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                >
                    <Descriptions.Item label="用户名">{username}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{email}</Descriptions.Item>
                </Descriptions>
                <Descriptions
                    title="曾用地址信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'30px'}}
                />
                

                <div>
                    <Table rowSelection={rowSelection} columns={this.columns} dataSource={accountAndLastTimeArray} />
                    <div style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={this.deleteAccount} disabled={!hasSelected} loading={loading}>
                            删除
                        </Button>
                        <span style={{ marginLeft: 8 }}>
                            {hasSelected ? `选中 ${selectedRowKeys.length} 项` : ''}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default PersonalInfo;



