// SQL语句封裝
const account = {
    //(username)
    //按名找所有地址，按时间降序排列
    queryByUsername: 'SELECT accountString,lastTime FROM account WHERE user_id= (SELECT id FROM user WHERE username =?) ORDER BY lastTime DESC',
    //(username, accountString)
    //确定此名此地址在数据库中有没有记录
    queryByUsernameAndAccount: 'SELECT id FROM account WHERE user_id= (SELECT id FROM user WHERE username =?) AND accountString =?',
    //(accountString, username)
    //给某个名增加一个地址
    insertAccount: 'INSERT INTO account (accountString, user_id) VALUES (?, (SELECT id FROM user WHERE username =?))',
    //(username, accountString)
    //给某个名删除一个地址
    deleteOneByUsername: 'DELETE FROM account WHERE user_id = (SELECT id FROM user WHERE username =?) AND accountString =?',
    //(username)
    //删除某个名的所有地址
    deleteAllByUsername: 'DELETE FROM account WHERE user_id = (SELECT id FROM user WHERE username =?)',
    //(username, accountString)
    //更新某个名的地址的最后使用时间
    updateTimeByUsername: 'UPDATE account SET time =IFNULL(time,0)+1 WHERE user_id = (SELECT id FROM user WHERE username =?) AND accountString =?'


};

module.exports = account;