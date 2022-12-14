//去mongodb中查询，而不是去区块链查询
var ecommerce_store_artifacts = require('../contracts/EcommerceStore.json');
var contract = require('truffle-contract');


//////////////////////////////////静态
// //web3 作为参数传入
// // var Web3 = require('web3');

// //HttpProvider is deprecated，HttpProvider不支持事件机制
// // var provider = new Web3.providers.HttpProvider('http://localhost:8545');
// //New ，WebsocketProvider支持事件机制
// var provider = new Web3.providers.WebsocketProvider('http://localhost:8545');
// // console.log("provider : ");
// // console.dir(provider);

// var EcommerceStore = contract(ecommerce_store_artifacts);
// EcommerceStore.setProvider(provider);



/////////////////////////////////动态
const getEcommerceStore = (web3) => new Promise((resolve, reject) => {
    try {
        var EcommerceStore = contract(ecommerce_store_artifacts);
        EcommerceStore.setProvider(web3.currentProvider);
        resolve(EcommerceStore);
    } catch (err) {
        reject(err);
    }


})

export default getEcommerceStore;