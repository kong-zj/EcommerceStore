const handlePrice = (priceInt) => {
    //输出合适的 price 表现方式
    let comparePrice = 1e18;
    let priceString = undefined;
    if (priceInt < comparePrice / 1e8) {
        //保持单位 wei
        priceString = priceInt.toString() + " wei";
    } else {
        //换算成单位 ETH
        priceString = (priceInt / comparePrice).toString() + " ETH";
    }
    return priceString;
}

export default handlePrice;