//去mongodb中查询，而不是去区块链查询
var ecommerce_store_artifacts = require('../contracts/Shopping.json');
var contract = require('truffle-contract');


const getShopping = (web3) => new Promise((resolve, reject) => {
    try {
        var Shopping = contract(ecommerce_store_artifacts);
        Shopping.setProvider(web3.currentProvider);
        resolve(Shopping);
    } catch (err) {
        reject(err);
    }


})

export default getShopping;