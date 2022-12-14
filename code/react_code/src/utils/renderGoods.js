import axios from "axios";


const renderGoods = (filters) =>
    //filter传给后台
    //给后台发请求

    new Promise((resolve, reject) => {

        axios.get('/product/getGoods', { params: filters })
            .then(data => {
                console.log("函数 renderGoods 的参数 filters 为 : ");
                console.dir(filters);
                console.log("axios.get('/product/getGoods' 返回的 data 为 : ");
                console.dir(data);
                ///data就是后端传来的items
                resolve(data);
            })
            .catch(err => {
                console.log("axios.get('/product/getGoods 请求失败 : " + err);
                reject(err);
            });
    });


export default renderGoods;