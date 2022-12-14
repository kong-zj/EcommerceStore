// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;
pragma experimental ABIEncoderV2;

import "./Tracing.sol";

// pragma solidity >=0.4.13;

contract Shopping {
    //是否卖完
    enum ProductStatus { Open, Sold }

    //总量
    uint public productIndex;
    //先由卖家信息查询，再由商品编号查询
    mapping (address => mapping(uint => Product)) stores;
    //卖家信息
    mapping (uint => address payable) productIdInStore;

    //溯源合约
    Tracing tracing = (new Tracing)();
    address tracingContract = address(tracing);
    

    struct Product {
        uint id;
        string name;
        string category;
        string[] imageLinkArray;
        string descLink;
        uint price;
        //以天为单位
        uint shippingTime;
        //库存
        uint inStockNum;
        //发货地
        uint[] originPlace;
        //是否有货
        ProductStatus status;
        //下面4个要同时修改
        //买家地址变长数组
        address payable[] buyer;
        // //用买家地址索引，还要区分一个买家的多笔交易
        // mapping (address =>  Order[]) orders;
        uint[] sum;
        //付款金额
        uint[] value;
        //是否成交
        bool[] dealed;
    }


    //用更简单的
    // //订单
    // struct Order{
    //     //购入数
    //     uint sum;
    //     //付款金额
    //     uint value;
    //     //是否成交
    //     bool dealed;
    // }


    //声明事件
    event NewGoods(uint _goodsId, string _name, string _category, string[] _imageLinkArray, string _descLink,
  uint _shippingTime, uint _inStockNum, uint _price, uint[] _originPlace);

    //更新相应在数据库中的剩余库存
    //如果库存为0，还会更新商品状态
    event BuyGoods(uint _goodsId, uint _lastInStockNum);

    constructor () public {
        productIndex = 0;
    }


    //接收多张图片hash
    function addGoodsToStore(string memory _name, string memory _category, string[] memory _imageLinkArray, string memory _descLink, uint _shippingTime,
                                uint _inStockNum, uint _price, uint[] memory _originPlace) public payable {
        require ( 0 < _inStockNum, "[ERROR] The number of goods should be greater than zero.");

        productIndex += 1;
        //初始化数组
        address payable[] memory buyer;
        uint[] memory sum;
        uint[] memory value;
        bool[] memory dealed;
        Product memory product = Product(productIndex, _name, _category, _imageLinkArray, _descLink, _price, _shippingTime, _inStockNum,
                                         _originPlace, ProductStatus.Open, buyer, sum, value, dealed);

        //绑定到总体结构中
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;

        //需要与mongodb同步数据的时候，触发事件
        emit NewGoods(productIndex, _name, _category, _imageLinkArray, _descLink, _shippingTime, _inStockNum,
                                        _price, _originPlace);
    }

    //可能返回空，要在前端进行判断
    function getGoods(uint _productId) view public returns (uint, string memory, string memory, string[] memory, string memory, uint, uint, uint, uint[] memory, ProductStatus) {

        //要向其中保存信息
        Product storage product = stores[productIdInStore[_productId]][_productId];

        //返回数组，用下标索引
        return (product.id, product.name, product.category, product.imageLinkArray, product.descLink, product.price, product.shippingTime, product.inStockNum, product.originPlace, product.status);
    }


    //订货
    function order(uint _productId, uint _sum) public payable returns (bool) {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        //msg.value是发送的钱
        require(msg.value >= product.price, "[ERROR] Value should be larger than or equal sum*price.");
        //订货量不能大于库存
        require(_sum <= product.inStockNum, "[ERROR] Sum should smaller than or equal inStockNum.");
        //商品可能没有库存了
        require(product.inStockNum >=0, "[ERROR] The number of inStockNum is less than zero.");

        // //把这个买家信息 msg.sender 记录到 buyers 数组中
        // //可能已经存在
        // bool flag = false;
        // uint buyerLen = product.buyers.length;
        // for(uint i=0; i<buyerLen; i++){
        //     if(msg.sender == product.buyers[i]){
        //         flag = true;
        //         break;
        //     }
        // }
        // if(flag){
        //     product.buyers.push(msg.sender);
        // }
        
        // //使用简单的
        // //记录到 orders 映射数组中
        // product.orders[msg.sender].push(Order(_sum, msg.value, false));

        // address payable[] buyer;
        // // //用买家地址索引，还要区分一个买家的多笔交易
        // // mapping (address =>  Order[]) orders;
        // uint[] sum;
        // //付款金额
        // uint[] value;
        // //是否成交
        // bool[] dealed;

        product.buyer.push(msg.sender);
        product.sum.push(_sum);
        product.value.push(msg.value);
        product.dealed.push(false);

        //降低库存数
        product.inStockNum -= _sum;

        //更新剩余库存
        emit BuyGoods(_productId, product.inStockNum);
        //向溯源合约中添加信息
        Tracing(tracingContract).addOneLineToInfoLine(2, _productId, msg.sender, "购买商品");

        if(product.inStockNum == 0){
            //改变商品状态
            product.status = ProductStatus.Sold;
            Tracing(tracingContract).addOneLineToInfoLine(2, _productId, msg.sender, "已售空");
        }

        return true;
    }

    //读出订货信息
    //返回数组
    function orderInfo(uint _productId) view public returns (address payable[] memory, uint[] memory, bool[] memory) {
        Product storage product = stores[productIdInStore[_productId]][_productId];

        // //这样处理边长数组问题
        // address payable[] memory buyer;
        // uint[] memory sum;
        // bool[] memory dealed;
        // //遍历product.buyers
        // uint buyerLen = product.buyers.length;
        // uint arrayIndex = 0;
        // //out
        // for(uint i=0; i < buyerLen; i++){
        //     //遍历product.orders[product.buyer]
        //     uint orderLen = product.orders[product.buyers[i]].length;
        //     //in
        //     for(uint j=0; j < orderLen; j++){
        //         //写入一轮数组
        //         // buyer[arrayIndex] = product.buyers[i];
        //         // sum[arrayIndex] = product.orders[product.buyers[i]][j].sum;
        //         // dealed[arrayIndex] = product.orders[product.buyers[i]][j].dealed;
        //         arrayIndex++;
        //         // buyer.push(product.buyers[i]);
        //         // sum.push(product.orders[product.buyers[i]][j].sum);
        //         // dealed.push(product.orders[product.buyers[i]][j].dealed);
        //     }
        // }
        return (product.buyer, product.sum, product.dealed);
    }

    //卖家发货
    function sendBySeller(uint _productId, uint _orderIndex) public returns (bool) {
        //确保只有真正的卖家可以调用此合约
        require(msg.sender == productIdInStore[_productId], "[ERROR] Only seller can use this function.");

        Product storage product = stores[productIdInStore[_productId]][_productId];

        //给卖家转钱
        msg.sender.transfer(product.value[_orderIndex]);
        //修改状态为已成交
        product.dealed[_orderIndex] = true;

        //向溯源合约中添加信息
        Tracing(tracingContract).addOneLineToInfoLine(2, _productId, msg.sender, "发货");

        return true;
    }


    //原卖家信息
    function sellerInfo(uint _productId) public view returns (address) {
        return productIdInStore[_productId];
    }

    //return num of product
    function getNumOfProduct() public view returns (uint) {
        return productIndex;
    }

    //溯源相关
    function getTracingInfo(uint _productId) public view returns(address[] memory, string[] memory, uint[] memory){
        return Tracing(tracingContract).getInfoLine(2, _productId);
    }


}
