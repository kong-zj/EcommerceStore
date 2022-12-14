// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;
pragma experimental ABIEncoderV2;

import "./Escrow.sol";
import "./Tracing.sol";

// pragma solidity >=0.4.13;

contract EcommerceStore {
    enum ProductStatus { Open, Sold, Unsold }
    enum ProductCondition { New, Used }

    uint public productIndex;
    mapping (address => mapping(uint => Product)) stores;
    //卖家地址
    mapping (uint => address payable) productIdInStore;
    //productId对应的托管合约地址
    mapping (uint => address) productEscrow;


    //溯源合约
    Tracing tracing = (new Tracing)();
    address tracingContract = address(tracing);
    

    struct Product {
        uint id;
        string name;
        string category;
        string[] imageLinkArray;
        string descLink;
        uint auctionStartTime;
        uint auctionEndTime;
        uint startPrice;
        address payable highestBidder;
        uint highestBid;
        uint secondHighestBid;
        uint totalBids;
        ProductStatus status;
        ProductCondition condition;
        mapping (address => mapping (bytes32 => Bid)) bids;
        uint auctionRevealTime;
    }

    struct Bid{
        address bidder;
        uint productId;
        uint value;
        bool revealed;
    }


    //声明事件
    event NewProduct(uint _productId, address _seller, string _name, string _category, string[] _imageLinkArray, string _descLink,
  uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition, uint _auctionRevealTime);

    event ChangeProduct(uint _productId, address _seller, uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition, uint _auctionRevealTime);

    event NewBid(uint _productId, address _bidder);

    event CreateEscrow(address _buyer, uint _amount);

    //合约中的买家卖家资金转移
    event DisburseAmount(address _buyer, uint _amount, address _beneficiary);
    //仲裁收入
    event ArbiterEarn(uint _amount, address _beneficiary);

    constructor () public {
        productIndex = 0;
    }

    //转卖商品,恢复和更改商品的一些信息
    function changeInfoToSellAgain(uint _productId, uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _auctionRevealTime) public payable {
        // require (_auctionStartTime < _auctionEndTime, "[ERROR] Acution start time should be earlier than end time.");

        //调用自己合约的函数
        // escrowInfo(uint _productId)
        // return (seller, buyer, arbiter, fundsDisbursed, releaseCount, refundCount);
        // returns (address payable, address payable, address, bool, uint, uint)
        address payable seller;
        address payable buyer;
        address arbiter;
        bool fundsDisbursed;
        uint releaseCount;
        uint refundCount;

        //资金托管合约地址
        address escrowAddress = escrowAddressForProduct(_productId);
        // require(escrowAddress > address(0), "[ERROR] Contract escrow should be exist before you can resell.");

        //如果有资金转移信息
        if(escrowAddress > address(0)){
            // 仲裁人介入后，才会有 资金托管合约的信息
            //提前使用会报错
            (seller, buyer, arbiter, fundsDisbursed, releaseCount, refundCount) = escrowInfo(_productId);

            //当前没有资金在托管
            // require(fundsDisbursed == true, "[ERROR] Contract Escrow has not prepared.");

            //"所有者"真的占有该物品吗
            //这里的"2"随着投票策略而改变
            if(releaseCount >= 2 && refundCount <=1){
                //只有买家能买掉
                // require (msg.sender == buyer, "[ERROR] Only buyer can sell this product again.");
            }
            else if(releaseCount <= 1 && refundCount >=2){
                //只有卖家能买掉
                // require (msg.sender == seller, "[ERROR] Only buyer can sell this product again.");
            }
            else{
                // //投票数据出错情况
                // require (false, "[ERROR] releaseCount and refundCount are error.");
            } 
              
        }
        //如果没人出价,商品还在卖家手上
        else if(escrowAddress == address(0)){
            require (msg.sender == productIdInStore[_productId], "[ERROR] Only owner can sell this product again.");
        }


        //这种写法会栈溢出
        //卖家信息改变，商品转让
        // string memory name = stores[productIdInStore[_productId]][_productId].name;
        // string memory category = stores[productIdInStore[_productId]][_productId].category;
        // string[] memory imageLinkArray = stores[productIdInStore[_productId]][_productId].imageLinkArray;
        // string memory descLink = stores[productIdInStore[_productId]][_productId].descLink;
        
        // stores[msg.sender][_productId] = Product(_productId, name, category, imageLinkArray, descLink, _auctionStartTime, _auctionEndTime,
        //                                 _startPrice, address(0), 0, 0, 0, ProductStatus.Open, ProductCondition.Used, _auctionRevealTime);
        
        
        stores[msg.sender][_productId] = stores[productIdInStore[_productId]][_productId];
        if( msg.sender != productIdInStore[_productId]){
            //删除旧的product, 节省gas
            delete stores[productIdInStore[_productId]][_productId];
        }
        
        //更新商品部分信息
        // uint auctionStartTime;
        // uint auctionEndTime;
        // uint startPrice;
        // uint auctionRevealTime;
        // ProductStatus status;
        // ProductCondition condition;
        stores[msg.sender][_productId].auctionStartTime = _auctionStartTime;
        stores[msg.sender][_productId].auctionEndTime = _auctionEndTime;
        stores[msg.sender][_productId].startPrice = _startPrice;
        stores[msg.sender][_productId].auctionRevealTime = _auctionRevealTime;
        stores[msg.sender][_productId].status = ProductStatus.Open;
        stores[msg.sender][_productId].condition = ProductCondition.Used;
        stores[msg.sender][_productId].highestBidder = address(0);
        stores[msg.sender][_productId].highestBid = 0;
        stores[msg.sender][_productId].secondHighestBid = 0;
        stores[msg.sender][_productId].totalBids = 0;

        productIdInStore[_productId] = msg.sender;

        //写入商品转卖溯源信息
        Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "转卖商品");

        //需要与mongodb同步数据的时候，触发事件
        emit ChangeProduct(_productId, msg.sender, _auctionStartTime, _auctionEndTime, _startPrice, 1, _auctionRevealTime);       
    }


    //接收多张图片hash
    function addProductToStore(string memory _name, string memory _category, string[] memory _imageLinkArray, string memory _descLink, uint _auctionStartTime,
                                uint _auctionEndTime, uint _startPrice, uint _productCondition, uint _auctionRevealTime) public payable {
        // require (_auctionStartTime < _auctionEndTime, "[ERROR] Acution start time should be earlier than end time.");

        productIndex += 1;
        Product memory product = Product(productIndex, _name, _category, _imageLinkArray, _descLink, _auctionStartTime, _auctionEndTime,
                                        _startPrice, address(0), 0, 0, 0, ProductStatus.Open, ProductCondition(_productCondition), _auctionRevealTime);

        // product 放入 stores，方便索引
        stores[msg.sender][productIndex] = product;
        productIdInStore[productIndex] = msg.sender;

        

        //写入商品上架溯源信息
        Tracing(tracingContract).addOneLineToInfoLine(1, productIndex, msg.sender, "卖家上架商品");

        //需要与mongodb同步数据的时候，触发事件
        emit NewProduct(productIndex, msg.sender, _name, _category, _imageLinkArray, _descLink, _auctionStartTime, _auctionEndTime, _startPrice, _productCondition, _auctionRevealTime);
    }

    //可能返回空，要在前端进行判断
    //这里在增加 revealTime 由用户设置时，返回数据格式发生变化，注意
    function getProduct(uint _productId) view public returns (uint, string memory, string memory, string[] memory, string memory, uint[3] memory, uint, ProductStatus, ProductCondition) {
        Product memory product = stores[productIdInStore[_productId]][_productId];

        //因为传参有不大于16个的限制，所以这里把同类型的3个uint(auctionStartTime, auctionEndTime, auctionRevealTime)组成数组
        //不然报错Stack too deep, try removing local variables
        uint[3] memory timeArray = [product.auctionStartTime, product.auctionEndTime, product.auctionRevealTime];
        //返回数组，用下标索引
        return (product.id, product.name, product.category, product.imageLinkArray, product.descLink, timeArray, product.startPrice, product.status, product.condition);
    }


    function bid(uint _productId, bytes32 _bid) public payable returns (bool) {
        //参数 _bid 是 keccak256 加密后的信息
        Product storage product = stores[productIdInStore[_productId]][_productId];
        //变量 now 将返回当前的unix时间戳（自1970年1月1日以来经过的秒数）
        // require(now >= product.auctionStartTime, "[ERROR] Current time should be later than auction start time.");
        // require(now <= product.auctionEndTime, "[ERROR] Current time should be earlier than auction end time.");
        // require(msg.value > product.startPrice, "[ERROR] Value should be larger than start price.");
        // require(product.bids[msg.sender][_bid].bidder == address(0), "[ERROR] Bidder should be null.");
        product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
        product.totalBids += 1;

        emit NewBid(product.id, msg.sender);
        return true;
    }

    function revealBid(uint _productId, string memory _amountStr, uint _amountInt, string memory _secret) public returns (uint){
        //storage是引用类型
        Product storage product = stores[productIdInStore[_productId]][_productId];
        // require(now >= product.auctionEndTime);
        // bytes32 sealedBid = sha3("EVWithdraw(_amount, _secret)");
        //注意这里的解析代码与js文件中的对应
        // bytes32 sealedBid = keccak256("EVWithdraw(_amount, _secret)");
        bytes32 sealedBid = keccak256(abi.encodePacked(_amountStr, _secret));
        Bid memory bidInfo = product.bids[msg.sender][sealedBid];
        require(bidInfo.bidder > address(0), "[ERROR] Bidder should exist.");
        require(bidInfo.revealed == false, "[ERROR] BId should not be revealed.");
        require(now <= product.auctionEndTime + (60* product.auctionRevealTime), "[ERROR] Current time should be earlier than reveal end time.");

        uint refund;
        uint amount = _amountInt;
        if(bidInfo.value < amount) {
            //押金不足，输掉竞拍，退还全部押金
            refund = bidInfo.value;
        } else {
            //第一个揭示报价
            if(address(product.highestBidder) == address(0)) {
                product.highestBidder = msg.sender;
                product.highestBid = amount;
                product.secondHighestBid = product.startPrice;
                //退还多余的押金，保留与出价相等的钱
                refund = bidInfo.value - amount;
            } else {
                //已经有之前的最高出价
                //成为当前最高报价者
                if(amount > product.highestBid) {
                    product.secondHighestBid = product.highestBid;
                    product.highestBidder.transfer(product.highestBid);
                    product.highestBid = amount;
                    product.highestBidder = msg.sender;
                    //退还多余的押金，保留与出价相等的钱
                    refund = bidInfo.value - amount;
                //成为当前第二高报价，更新第二高报价，因为竞拍成功者按第二高价付款
                } else if(amount > product.secondHighestBid) {
                    product.secondHighestBid = amount;
                    refund = bidInfo.value;
                //竞价不够高，退押金
                } else {
                    refund = bidInfo.value;
                }
            }
        }
        product.bids[msg.sender][sealedBid].revealed = true;
        if(refund > 0) {
            //退钱
            msg.sender.transfer(refund);
        }
        return refund;
    }
    


    function highestBidderInfo(uint _productId) public view returns (address, uint, uint) {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        return (product.highestBidder, product.highestBid, product.secondHighestBid);
    }

    function totalBids(uint _productId) public view returns (uint) {
        Product storage product = stores[productIdInStore[_productId]][_productId];
        return product.totalBids;
    }

    //return num of product
    function getNumOfProduct() public view returns (uint) {
        return productIndex;
    }

    //仲裁人获取收益
    //获得成功交易额的百分之1  &&  自己押金的百分之10  中的较小者
    function finalizeAuction(uint _productId) public payable {
        //msg.value是仲裁人的押金

        //memory不能永久存储，更改之后还要刷回去
        // Product memory product = stores[productIdInStore[_productId]][_productId];
        //storage是引用类型
        Product storage product = stores[productIdInStore[_productId]][_productId];
        // require((now > product.auctionEndTime), "[ERROR]Current time should be later than auction end time.");
        require(product.status == ProductStatus.Open, "[ERROR]Product status should be open.");
        require(msg.sender != productIdInStore[_productId], "[ERROR]Caller should not be seller.");
        require(msg.sender != product.highestBidder, "[ERROR]Caller should not be buyer.");

        //注意，if(product.totalBids == 0)的写法，会漏掉有bid但没有reveal的情况
        //有bid但没有reveal的情况，可以在js中提醒（函数renderProductDetails的if(parseInt(p[8]) == 1)中）
        // if(product.totalBids == 0){
        if(product.highestBidder == address(0)){
            product.status = ProductStatus.Unsold;
            //给仲裁人退保证金
            msg.sender.transfer(msg.value);
        } 
        else {
            //new出来的地址，保存在合约EcommerceStore，所以调用的方法，与调用EcommerceStore时不同
            //支付次高价
            //定义合约类型
            //转入 product.secondHighestBid+msg.value 两份押金
            Escrow escrow = (new Escrow).value(product.secondHighestBid+msg.value)(_productId, productIdInStore[_productId], product.highestBidder, msg.sender, msg.value);
            //代替Escrow合约中的事件
            emit CreateEscrow(product.highestBidder, product.secondHighestBid+msg.value);
            //保存地址
            productEscrow[_productId] = address(escrow);
            product.status = ProductStatus.Sold;

            //退回支付第二高价后多余的钱
            uint refund = product.highestBid - product.secondHighestBid;
            product.highestBidder.transfer(refund);
            
        }
        

        //写入溯源信息
        Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "成为仲裁人");

        //写入最高出价者溯源信息
        address highestBidder;
        uint highestBid;
        uint secondHighestBid;
        string memory highestBidderTracingInfo;
        (highestBidder, highestBid, secondHighestBid) = this.highestBidderInfo(_productId);
        //有人赢得竞拍
        if(highestBidder > address(0)){
            //字符串拼接
            // highestBidderTracingInfo = strConcat("最高出价人( ", strConcat(addrToStr(highestBidder), strConcat(" )以次高报价( ", strConcat(intToStr(secondHighestBid), " wei )赢得竞拍"))));
            highestBidderTracingInfo = "存在最高出价人，拍卖锁定";
        }//没人赢得竞拍
        else{
            highestBidderTracingInfo = "无人出价";
        }
        
        Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, highestBidderTracingInfo);

        //上面定义为storage，不用刷回去了
        // //刷回去
        // stores[productIdInStore[_productId]][_productId] = product;

    }

//     function strConcat(string memory _a, string memory _b) private pure returns (string memory){
//         bytes memory _ba = bytes(_a);
//         bytes memory _bb = bytes(_b);
//         string memory ret = new string(_ba.length + _bb.length);
//         bytes memory bret = bytes(ret);
//         uint k = 0;
//         for (uint i = 0; i < _ba.length; i++) bret[k++] = _ba[i];
//         for (uint i = 0; i < _bb.length; i++) bret[k++] = _bb[i];
//         return string(ret);
//    }  

    // //溯源相关
    // function getTracingInfo(uint _productId) public view returns(address[] memory, string[] memory, string[] memory){
    //     return Tracing(tracingContract).getInfoLine(1, _productId);
    // }

    //溯源相关
    function getTracingInfo(uint _productId) public view returns(address[] memory, string[] memory, uint[] memory){
        return Tracing(tracingContract).getInfoLine(1, _productId);
    }

    function escrowAddressForProduct(uint _productId) public view returns(address){
        //web3中不能直接调用Escrow合约，要通过EcommerceStore间接调用
        return productEscrow[_productId];
    }

    // 仲裁人介入后，才会有 资金托管合约的信息
    function escrowInfo(uint _productId) public view returns (address payable, address payable, address, bool, uint, uint) {
        //把address转换为Escrow对象
        return Escrow(productEscrow[_productId]).escrowInfo();
    }

    // //查询买卖押金和仲裁人押金
    // function escrowAmountInfo(uint _productId) public view returns (uint, uint) {
    //     //把address转换为Escrow对象
    //     return Escrow(productEscrow[_productId]).escrowAmountInfo();
    // }
    

    //原卖家信息
    function sellerInfo(uint _productId) public view returns (address) {
        return productIdInStore[_productId];
    }

    //EcommerceStore 合约会调用托管合约里面的 release 和 refund 函数
    function releaseAmountToSeller(uint _productId) public {
        //用合约调用合约，被调用合约中的msg.sender是本合约
        //所以需要用参数传递用户的地址，本合约中的msg.sender是用户地址
        bool hasRelease;
        address payable buyer;
        address payable seller;
        uint sellEarn;
        address payable arbiter;
        uint arbitEarn;
        (hasRelease, buyer, seller, sellEarn, arbiter, arbitEarn) = Escrow(productEscrow[_productId]).releaseAmountToSeller(msg.sender);
        // (true, buyer, seller, amount, arbiter, arbiterEarnAmount);
        if(hasRelease){
            emit DisburseAmount(buyer, sellEarn, seller);
            emit ArbiterEarn(arbitEarn, arbiter);
        }

        //写入溯源信息
        Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "同意资金付款给卖家");
        if(hasRelease){
            //写入资金转移溯源信息
            Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "托管合约已将资金交付给卖家");
        }
    }
    
    function refundAmountToBuyer(uint _productId) public {
        //用合约调用合约，被调用合约中的msg.sender是本合约
        bool hasRefund = Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
        //写入溯源信息
        Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "同意资金退还给买家");
        if(hasRefund){
            //没有真的卖出，要把状态改回来
            stores[productIdInStore[_productId]][_productId].status = ProductStatus.Unsold;
            //写入资金转移溯源信息
            Tracing(tracingContract).addOneLineToInfoLine(1, _productId, msg.sender, "托管合约已将资金退还给买家");
        }
    }

}
