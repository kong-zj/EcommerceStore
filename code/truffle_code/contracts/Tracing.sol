// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;
pragma experimental ABIEncoderV2;


// pragma solidity >=0.4.13;

contract Tracing {

    //总量
    uint public tracingIndex;
    //先由类别信息(第一个uint)(拍卖=1, 买卖=2)查询，再由商品编号(第二个uint)查询
    mapping (uint => mapping(uint => Trace)) infomation;

    //add because function stringToUint
    mapping (bytes1 => uint) bytes1ToUintTable;
    

    // //某一个商品的溯源信息
    // struct Trace {
    //     InfoLine[] Lines;
    // }

    // //某个商品的单条溯源信息
    // struct InfoLine{
    //     //信息发布人
    //     address publisher;
    //     //描述语句的IPFS解析链接
    //     string descLink;
    //     //发生时间
    //     string exeTimeString;
    // }

    //一个商品的多条溯源信息
    struct Trace {
        //信息发布人
        address[] publisher;
        //描述语句的IPFS解析链接
        string[] descLink;
        //发生时间
        uint[] exeTimeString;

    }



    constructor () public {
        tracingIndex = 0;
    }

    // //向其中一个商品添加一条溯源信息
    // function addOneLineToInfoLine(uint  _class, uint  _ID, string memory _descLink, string memory  _exeTimeString) public {
    //     //暂时只有两类
    //     require ( _class == 1 || _class == 2, "[ERROR] The class of tracing should be equal 1 or 2.");

    //     tracingIndex += 1;
    //     InfoLine memory Lines = InfoLine(msg.sender, _descLink,  _exeTimeString);

    //     //绑定到总体结构中
    //     //给数组添加一个元素
    //     infomation[_class][_ID].Lines.push(Lines);
    // }

    //向其中一个商品添加一条溯源信息
    function addOneLineToInfoLine(uint  _class, uint  _ID, address _publisher, string memory _descLink) public {
        //暂时只有两类
        require ( _class == 1 || _class == 2, "[ERROR] The class of tracing should be equal 1 or 2.");

        tracingIndex += 1;

        //绑定到总体结构中
        //给数组添加一个元素
        infomation[_class][_ID].publisher.push(_publisher);
        infomation[_class][_ID].descLink.push(_descLink);
        infomation[_class][_ID].exeTimeString.push(now);
    }

    // //可能返回空，要在前端进行判断
    // function getInfoLine(uint  _class, uint  _ID) view public returns (InfoLine[] memory) {
    //     //暂时只有两类
    //     require ( _class == 1 || _class == 2, "[ERROR] The class of tracing should be equal 1 or 2.");
    //     //返回数组，用下标索引
    //     return (infomation[_class][_ID].Lines);
    // }

    //返回空，要在前端进行判断
    function getInfoLine(uint  _class, uint  _ID) view public returns (address[] memory, string[] memory, uint[] memory) {
        //暂时只有两类
        require ( _class == 1 || _class == 2, "[ERROR] The class of tracing should be equal 1 or 2.");
        //返回数组，用下标索引
        return (infomation[_class][_ID].publisher, infomation[_class][_ID].descLink, infomation[_class][_ID].exeTimeString);
    }


    //return num of tracing
    function getNumOfTracing() public view returns (uint) {
        return tracingIndex;
    }

}