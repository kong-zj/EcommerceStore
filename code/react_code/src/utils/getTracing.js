//去mongodb中查询，而不是去区块链查询
var ecommerce_store_artifacts = require('../contracts/Tracing.json');
var contract = require('truffle-contract');


const getTracing = (web3) => new Promise((resolve, reject) => {
    try {
        var Tracing = contract(ecommerce_store_artifacts);
        Tracing.setProvider(web3.currentProvider);
        resolve(Tracing);
    } catch (err) {
        reject(err);
    }


})

export default getTracing;