import axios from "axios";


const renderProducts = (filters) =>
    //filter传给后台
    //给后台发请求

    new Promise((resolve, reject) => {

        axios.get('/product/getProducts', { params: filters })
            .then(data => {
                console.log("函数 renderProducts 的参数 filters 为 : ");
                console.dir(filters);
                console.log("axios.get('/product/getProducts' 返回的 data 为 : ");
                console.dir(data);
                ///data就是后端传来的items
                resolve(data);
            })
            .catch(err => {
                console.log("axios.get('/product/getProducts 请求失败 : " + err);
                reject(err);
            });
    });


export default renderProducts;