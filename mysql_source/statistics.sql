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

 Date: 06/03/2022 20:27:51
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for statistics
-- ----------------------------
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE `statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  `user_id` int(11) NOT NULL,  
  `bid_num` int(11) DEFAULT 0 NOT NULL,
  `buy_num` int(11) DEFAULT 0 NOT NULL,
  `sell_earn` DOUBLE DEFAULT 0 NOT NULL,
  `arbit_earn` DOUBLE DEFAULT 0 NOT NULL,
  `escrow_through` DOUBLE DEFAULT 0 NOT NULL,
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  FOREIGN KEY (`user_id`)
  references user(`id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
