import React, { Component } from "react";
import 'antd/dist/antd.css';
import { Typography, Divider } from 'antd';


class HelpInfo extends Component {

    render() {
        const { Title, Paragraph, Text, Link } = Typography;

        const blockContent = `AntV 是蚂蚁金服全新一代数据可视化解决方案，致力于提供一套简单方便、专业可靠、不限可能的数据可视化最佳实践。得益于丰富的业务场景和用户需求挑战，AntV 经历多年积累与不断打磨，已支撑整个阿里集团内外 20000+ 业务系统，通过了日均千万级 UV 产品的严苛考验。
我们正在基础图表，图分析，图编辑，地理空间可视智能可视化等各个可视化的领域耕耘，欢迎同路人一起前行。`;
        return (

            <
            Typography >

            <

            Title > 介绍 < /Title> <
            Paragraph >
            这是一个去中心化的，所有的商业逻辑和数据将会放在以太坊区块链上，使用智能合约托管资金的电子商务系统，旨在降低用户交易的中间费用，同时具有溯源、防伪等功能。 <
            /Paragraph> 
           
            </Typography>

        );

    }
}

export default HelpInfo;