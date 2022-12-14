import React, {Component} from 'react';
import * as echarts from 'echarts/core';
import {GridComponent, TitleComponent, TooltipComponent, ToolboxComponent } from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {Card} from 'antd';

import cookie from 'react-cookies';

import { LineChart } from 'echarts/charts';
import './index.css'
import renderStatistics from '../../utils/renderStatistics'

import ProductChart from "../../components/ProductsChart"

import getWeb3 from "../../utils/getWeb3";

echarts.use(
    [GridComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent, ToolboxComponent]
);

export default class TotalChart extends Component {

    state = {
        web3 : null,
        account : null,
        escrow_through : null,
        success_precent : null,
        product_all_num : null,
        product_user_num : null,
        bid_user_num : null,
        buy_user_num : null,
        sell_earn : null,
        arbit_earn : null,
    }

    async componentDidMount () {
        const web3 = await getWeb3();
        let account = await web3.eth.getAccounts();
        console.log("---------------统计使用的userName为 : " + cookie.load('username'));
        let escrow_through = await this.getNumInfo("escrow_through");
        let success_precent = await this.getNumInfo("success_precent");
        let product_all_num = await this.getNumInfo("product_all_num");
        let product_user_num = await this.getNumInfo("product_user_num");
        let bid_user_num = await this.getNumInfo("bid_user_num");
        let buy_user_num = await this.getNumInfo("buy_user_num");
        let sell_earn = await this.getNumInfo("sell_earn");
        let arbit_earn = await this.getNumInfo("arbit_earn");

        this.setState({
             web3: web3,
             account: account,
             escrow_through : escrow_through,
            success_precent : success_precent,
            product_all_num : product_all_num,
            product_user_num : product_user_num,
            bid_user_num : bid_user_num,
            buy_user_num : buy_user_num ,
            sell_earn : sell_earn,
            arbit_earn : arbit_earn,
        });
            



    }

    //注意同步，不然还没得到结果，就把null返回了
    getNumInfo = async(process) => {
        //process 可能的值为
        // escrow_through, success_precent, product_all_num, product_user_num, bid_user_num, buy_user_num, sell_earn, arbit_earn

            let result = await renderStatistics({ process: process, userName:cookie.load('username') });
            console.log("向后端请求数据 renderStatistics, process = " + process + " 请求到的数据为 : ");
            console.dir(result.data);
            return result.data;   
    }


    render () {
        const {onlineNumber, offlineNumber, deviceArray} = this.state;
        return (
            <div>
                {/* 函数组件的传参 */}
                {/* , escrow_through, success_precent, product_all_num, product_user_num, bid_user_num, buy_user_num, sell_earn, arbit_earn */}
            <ProductChart
                escrow_through={this.state.escrow_through/10e18}
                success_precent={this.state.success_precent}
                product_all_num={this.state.product_all_num}
                product_user_num={this.state.product_user_num}
                bid_user_num={this.state.bid_user_num}
                buy_user_num={this.state.buy_user_num}
                sell_earn={this.state.sell_earn/10e18}
                arbit_earn={this.state.arbit_earn/10e18}

            ></ProductChart>

            
            
        
        </div>

        );
    }
}