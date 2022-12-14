// SQL语句封裝
const statistics = {

    //(accountString)
    //找到某个地址对应的账户ID
    queryUserIdByAccount: 'SELECT user_id FROM account WHERE accountString = ?',
    //(name)
    //找到某个name对应的账户ID
    queryIdByUserName: 'SELECT id FROM user WHERE userName = ?',
    //(use_id)
    //找到某个name对应的账户ID
    queryAccountByUserId: 'SELECT accountString FROM account WHERE user_id = ?;',
    //(user_id)
    //查找
    queryByUserId: 'SELECT id FROM statistics WHERE user_id=? ',
    //(user_id)
    //没有该账户ID的line，就创建这个line
    insertLineByUserId: 'INSERT INTO statistics (user_id) VALUES (?)',
    //(user_id)
    //给对应id的用户的bid_num字段加1
    addBidNumByUserId: 'UPDATE statistics SET bid_num=bid_num+1 WHERE user_id=?',
    //(user_id)
    //给对应id的用户的onSell_num字段加1
    addOnSellNumByUserId: 'UPDATE statistics SET onSell_num=onSell_num+1 WHERE user_id=?',
    //(user_id)
    //给对应id的用户的buy_num字段加1
    addBuyNumByUserId: 'UPDATE statistics SET buy_num=buy_num+1 WHERE user_id=?',
    //(sell_earn, user_id)
    //给对应id的用户的sell_earn字段加sell_earn
    addSellEarnByUserId: 'UPDATE statistics SET sell_earn=sell_earn+? WHERE user_id=?',
    //(arbit_earn, user_id)
    //给对应id的用户的arbit_earn字段加arbit_earn
    addArbitEarnByUserId: 'UPDATE statistics SET arbit_earn=arbit_earn+? WHERE user_id=?',
    //(escrow_through, user_id)
    //给对应id的用户的arbit_earn字段加arbit_earn
    addEscrowThroughByUserId: 'UPDATE statistics SET escrow_through=escrow_through+? WHERE user_id=?',
    //(user_id)
    //读取bid_num
    queryBidNumByUserId: 'SELECT bid_num FROM statistics WHERE user_id=? ',
    //(user_id)
    //读取buy_num
    queryBuyNumByUserId: 'SELECT buy_num FROM statistics WHERE user_id=? ',
    //(user_id)
    //读取sell_earn
    querySellEarnByUserId: 'SELECT sell_earn FROM statistics WHERE user_id=? ',
    //(user_id)
    //读取arbit_earn
    queryArbitEarnByUserId: 'SELECT arbit_earn FROM statistics WHERE user_id=? ',
    //读取escrow_through之和
    querySumEscrowThrough: 'SELECT SUM(escrow_through) as sum FROM statistics',
    //读取sell_earn之和
    querySumSellEarn: 'SELECT SUM(sell_earn) as sum FROM statistics',


};

module.exports = statistics;