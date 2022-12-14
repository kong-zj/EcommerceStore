import React, { useState } from 'react';
import ProCard, { StatisticCard } from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';


const { Statistic } = StatisticCard;

function ProductsChart (props)  {
  const [responsive, setResponsive] = useState(false);
  //用来测试显示效果
  // escrow_through=66;
  // success_precent=77;
  // product_all_num=55;
  // product_user_num=88;
  // bid_user_num=22;
  // buy_user_num=44;
  // sell_earn=11;
  // arbit_earn=55;

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <ProCard split={responsive ? 'horizontal' : 'vertical'}>
        <StatisticCard
          colSpan={responsive ? 24 : 6}
          title="资金托管合约总流水"
          statistic={{
            value: props.escrow_through,
            suffix: 'ETH',
            description: <Statistic title="日同比" value="0%" trend="up" />,
          }}
          
          chart={
            <img
              src="https://gw.alipayobjects.com/zos/alicdn/PmKfn4qvD/mubiaowancheng-lan.svg"
              alt="进度条"
              width="100%"
            />
          }
          footer={
            <>
              <Statistic value={Math.round(props.success_precent * 100) / 100 + "%"} title="撮合成功占比" layout="horizontal" />
            </>
          }
        >
        </StatisticCard>
        <StatisticCard.Group
          colSpan={responsive ? 24 : 18}
          direction={responsive ? 'column' : undefined}
        >
          <StatisticCard>
            <Statistic
          title= '总商品数'
          value={props.product_all_num}
          layout="vertical"
          description={<Statistic title="日同比" value="0%" trend="up" />}
        />
            <p>  </p> 
            <Statistic
              title="您发布的商品数"
              value={props.product_user_num}
              layout="vertical"
              description={<Statistic title="日同比" value="0%" trend="down" />}
            />
          </StatisticCard>
          <StatisticCard>
            <Statistic
              title='您的出价次数'
              value={props.bid_user_num}
              layout="vertical"
              description={<Statistic title="日同比" value="0%" trend="down" />}
            />
            <p>  </p> 
            <Statistic
              title="您购入的商品数"
              value={props.buy_user_num}
              layout="vertical"
              description={<Statistic title="日同比" value="0%" trend="up" />}
            />
          </StatisticCard>
          <StatisticCard>
            <Statistic
              title='您的出售收入'
              value={props.sell_earn}
              suffix='ETH'
              layout="vertical"
              description={<Statistic title="日同比" value="0%" trend="up" />}
            />
            <p>  </p> 
            <Statistic
              title="您的仲裁收入"
              value={props.arbit_earn}
              suffix='ETH'
              layout="vertical"
              description={<Statistic title="日同比" value="0%" trend="down" />}
            />
          </StatisticCard>
        </StatisticCard.Group>
      </ProCard>
    </RcResizeObserver>
  );
};
export default ProductsChart;
