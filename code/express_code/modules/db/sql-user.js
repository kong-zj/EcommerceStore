// SQL语句封裝
const user = {
    //(username)
    //按名查找
    queryByUsername: 'SELECT * FROM user WHERE username=?',
    //(username, password, email)
    //增加行
    insertUser: 'INSERT INTO user (username, password, email) VALUES (?, ?, ?)',
    //(email)
    //按邮箱查找
    queryByEmail: 'SELECT * FROM user WHERE email=?',
    //(password, email)
    //按邮箱更新密码
    updatePassword: 'UPDATE user SET password=? WHERE email=?'

};

module.exports = user;