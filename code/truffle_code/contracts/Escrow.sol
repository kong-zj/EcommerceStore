// SPDX-License-Identifier: SimPL-2.0

pragma solidity >=0.4.21 <8.10.0;

// pragma solidity >=0.4.13;

contract Escrow{
    //基本信息
    uint public productId;
    address payable public seller;
    address payable public buyer;
    address payable public arbiter;
    //交易押金
    uint public amount;
    //仲裁人押金
    uint public arbiterAmount;

    //托管的合约状态
    mapping(address => bool) releaseAmount;
    //mapping不能遍历，所以需要计数器count
    uint public releaseCount;
    mapping(address => bool) refundAmount;
    uint public refundCount;
    //资金是否已转走
    bool fundsDisbursed;


    //由主合约生成的子合约，emit事件，外部接收不到，当作为函数的返回值返回

    // //事件
    // //新建资金托管合约
    // event CreateEscrow(uint _productId, address _seller, address _buyer, address _arbiter, uint _amount, uint _arbiterAmount);
    // //3人投票, _operation: 0为释放给卖家, 1为退还给买家
    // event UnlockAmount(uint _productId, uint _operation, address _operator);
    // //合约中的买家卖家资金转移
    // //toSellerOrBuyer 为0 表示转给卖家, 为1 表示转给买家
    // event DisburseAmount(uint _productId, uint toSellerOrBuyer, address _buyer, uint _amount, address _beneficiary);
    // //仲裁收入
    // event ArbiterEarn(uint _productId, uint _amount, address _beneficiary);


    //把钱存进来
    constructor(uint _productId, address payable _seller, address payable _buyer, address payable _arbiter, uint _arbiterAmount) public payable {
        productId = _productId;
        seller = _seller;
        buyer = _buyer;
        arbiter = _arbiter;
        //买卖交易押金
        amount = msg.value - _arbiterAmount;
        //仲裁人押金
        arbiterAmount = _arbiterAmount;
        //初始为0
        releaseCount = 0;
        refundCount = 0;
        fundsDisbursed = false;
        // emit CreateEscrow(_productId, _seller, _buyer, _arbiter, amount, arbiterAmount);
    }

    function escrowInfo() public view returns(address payable, address payable, address payable, bool, uint ,uint) {
        return (seller, buyer, arbiter, fundsDisbursed, releaseCount, refundCount);
    }

    // //查询买卖押金和仲裁人押金
    // function escrowAmountInfo() public view returns(uint ,uint) {
    //     return (amount, arbiterAmount);
    // }

    //释放资金给卖家
    function releaseAmountToSeller(address _caller) public returns(bool, address payable, address payable, uint, address payable, uint){
        //注意msg.sender是合约EcommerceStore，不是真正的用户，真正的用户是_caller
        require(!fundsDisbursed, "[ERROR]Funds should not be disbursed.");
        require((_caller == seller || _caller == buyer || _caller == arbiter), "[ERROR]Caller should be seller or buyer or arbiter.");
        //不能重复投票
        if(!releaseAmount[_caller]){
            //这个人想要释放
            releaseAmount[_caller] = true;
            releaseCount += 1;
            // emit UnlockAmount(productId, 0, _caller);
        }
        //2/3的人同意
        if(releaseCount >= 2){
            //仲裁人获取收益
            //获得成功交易额的百分之1  &&  自己押金的百分之10  中的较小者
            //arbiterAmount是押金数量
            //arbiterEarnAmount是赚钱数量
            uint amount1 = amount/100;
            uint amount2 = arbiterAmount/10;
            uint arbiterEarnAmount = amount1 < amount2 ? amount1 : amount2;

            //给卖家转钱(付仲裁金)
            seller.transfer(amount - arbiterEarnAmount);
            // emit DisburseAmount(productId, 0, buyer, amount, seller);

            //给仲裁人转钱(赚仲裁金)
            arbiter.transfer(arbiterAmount + arbiterEarnAmount);
            fundsDisbursed = true;
            // emit ArbiterEarn(productId, arbiterEarnAmount, arbiter);

            // true, 卖家, 买卖金额, 仲裁人, 仲裁所得
            return (true, buyer, seller, amount, arbiter, arbiterEarnAmount);
        }
    }

    function refundAmountToBuyer(address _caller) public returns(bool){
        require(!fundsDisbursed, "[ERROR]Funds should not be disbursed.");
        require((_caller == seller || _caller == buyer || _caller == arbiter), "[ERROR]Caller should be seller or buyer or arbiter.");
        if(!refundAmount[_caller]){
            refundAmount[_caller] = true;
            refundCount += 1;
            // emit UnlockAmount(productId, 1, _caller);
        }
        if(refundCount >= 2){
            //给买家转钱(不付仲裁金)
            buyer.transfer(amount);
            // emit DisburseAmount(productId, 1, buyer, amount, buyer);

            //给仲裁人转钱(不赚仲裁金)
            arbiter.transfer(arbiterAmount);
            fundsDisbursed = true;

            return true;
        }
    }

}