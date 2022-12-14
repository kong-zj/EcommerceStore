const ipfsReadConfig = {
    host: 'localhost',
    port: '8080',
    protocol: 'http'
};
//ipfsUrlBefore 连接上 hash 就可以直接用来读取了
const ipfsReadUrlBefore = ipfsReadConfig.protocol + "://" + ipfsReadConfig.host + ":" + ipfsReadConfig.port + "/ipfs/";

module.exports = ipfsReadUrlBefore