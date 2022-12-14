/*
 Navicat MySQL Data Transfer

 Source Server         : root
 Source Server Type    : MySQL
 Source Server Version : 80023
 Source Host           : 127.0.0.1:3306
 Source Schema         : my_dapp_db

 Target Server Type    : MySQL
 Target Server Version : 80023
 File Encoding         : 65001

 Date: 06/03/2022 20:27:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for account
-- "CASCADE级联,也更新子表中的记录"
-- "与之相对的是RESTRICT,如果有对应外键,不允许更新"
-- "TIMESTAMP是时间戳"
-- "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 表示插入和更新时自动设置为当前时间"
-- FOREIGN KEY 约束 一个表中的 FOREIGN KEY 指向另一个表中的 UNIQUE KEY
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (

  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  `lastTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `accountString` varchar(70) NOT NULL,
  `user_id` int(11) NOT NULL,
  `time` int(11) DEFAULT 0 NOT NULL,
  FOREIGN KEY (`user_id`)
  references user(`id`)
  ON UPDATE CASCADE
  ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
