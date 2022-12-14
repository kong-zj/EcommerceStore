import ProductOrigin from "../static/ProductOrigin";

//参数 [int,int]
const handleAddress = (addressInt) => {
    //解析成字符串
    let shengInt = addressInt[0];
    let shiInt = addressInt[1];

    let addressString = "";

    //解析省
    var shengData = ProductOrigin.filter(function(fp) {
            return fp.value === shengInt;
        })
        // console.log("sheng = " + shengData[0].label);
    addressString += shengData[0].label + ",";

    //解析市
    var shiData = shengData[0].children.filter(function(fp) {
            return fp.value === shiInt;
        })
        // console.log("shi = " + shiData[0].label);
    addressString += shiData[0].label;

    return addressString;
}

export default handleAddress;