/*
SQLyog Community v13.2.1 (64 bit)
MySQL - 8.0.43 : Database - homework
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`homework` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `homework`;

/*Table structure for table `homeworks` */

DROP TABLE IF EXISTS `homeworks`;

CREATE TABLE `homeworks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '作业id',
  `title` varchar(200) DEFAULT NULL COMMENT '作业标题',
  `description` text COMMENT '作业描述/作业要求',
  `department` enum('backend','frontend','sre','product','design','android','ios') DEFAULT NULL COMMENT '所属部门',
  `creator_id` bigint unsigned DEFAULT NULL COMMENT '发布者id',
  `deadline` timestamp NULL DEFAULT NULL COMMENT '截止时间(Asia/Shanghai)',
  `allow_late` tinyint(1) DEFAULT NULL COMMENT '是否允许补交',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `id_title` (`title`),
  CONSTRAINT `homeworks_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



DROP TABLE IF EXISTS `submissions`;

CREATE TABLE `submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `homework_id` bigint unsigned DEFAULT NULL COMMENT '作业id',
  `student_id` bigint unsigned DEFAULT NULL COMMENT '学员id',
  `content` text COMMENT '提交内容/链接',
  `file_url` varchar(500) DEFAULT NULL COMMENT '附件地址',
  `is_late` tinyint(1) DEFAULT NULL COMMENT '是否迟交',
  `score` int DEFAULT NULL COMMENT '分数',
  `comment` text COMMENT '老师评语',
  `is_excellent` tinyint(1) DEFAULT NULL COMMENT '是否是优秀作业',
  `reviewer_id` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `submission_count` int DEFAULT '0' COMMENT '提交人数',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `reviewer_id` (`reviewer_id`),
  KEY `fk_submissions_homework` (`homework_id`),
  CONSTRAINT `fk_submissions_homework` FOREIGN KEY (`homework_id`) REFERENCES `homeworks` (`id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`homework_id`) REFERENCES `homeworks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '昵称',
  `role` enum('student','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'student' COMMENT '角色',
  `department` enum('backend','frontend','sre','product','design','android','ios') DEFAULT NULL COMMENT '所属部门',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '""' COMMENT '邮箱',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `id_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 创建 teacher_students 表

DROP TABLE IF EXISTS teacher_students;

CREATE TABLE teacher_students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP PROCEDURE IF EXISTS init_homework_data;

DELIMITER $$

CREATE PROCEDURE init_homework_data()
BEGIN

DECLARE dept VARCHAR(20);
DECLARE i INT;
DECLARE teacher1 BIGINT;
DECLARE teacher2 BIGINT;
DECLARE s1 BIGINT;
DECLARE s2 BIGINT;
DECLARE s3 BIGINT;
DECLARE hw BIGINT;

-- 部门列表
DECLARE dept_cursor CURSOR FOR 
SELECT 'backend'
UNION SELECT 'frontend'
UNION SELECT 'sre'
UNION SELECT 'product'
UNION SELECT 'design'
UNION SELECT 'android'
UNION SELECT 'ios';

DECLARE CONTINUE HANDLER FOR NOT FOUND SET i = NULL;

OPEN dept_cursor;

dept_loop: LOOP

FETCH dept_cursor INTO dept;
IF dept IS NULL THEN
LEAVE dept_loop;
END IF;

-- 创建老师
INSERT INTO users(username,password,nickname,role,department,email)
VALUES(CONCAT(dept,'_teacher1'),'123456',CONCAT(dept,'老师1'),'admin',dept,CONCAT(dept,'t1@test.com'));

SET teacher1 = LAST_INSERT_ID();

INSERT INTO users(username,password,nickname,role,department,email)
VALUES(CONCAT(dept,'_teacher2'),'123456',CONCAT(dept,'老师2'),'admin',dept,CONCAT(dept,'t2@test.com'));

SET teacher2 = LAST_INSERT_ID();

-- 创建学生
INSERT INTO users(username,password,nickname,role,department,email)
VALUES(CONCAT(dept,'_student1'),'123456',CONCAT(dept,'学生1'),'student',dept,CONCAT(dept,'s1@test.com'));

SET s1 = LAST_INSERT_ID();

INSERT INTO users(username,password,nickname,role,department,email)
VALUES(CONCAT(dept,'_student2'),'123456',CONCAT(dept,'学生2'),'student',dept,CONCAT(dept,'s2@test.com'));

SET s2 = LAST_INSERT_ID();

INSERT INTO users(username,password,nickname,role,department,email)
VALUES(CONCAT(dept,'_student3'),'123456',CONCAT(dept,'学生3'),'student',dept,CONCAT(dept,'s3@test.com'));

SET s3 = LAST_INSERT_ID();

-- 老师绑定学生
INSERT INTO teacher_students(teacher_id,student_id) VALUES
(teacher1,s1),(teacher1,s2),(teacher1,s3),
(teacher2,s1),(teacher2,s2),(teacher2,s3);

-- 每个老师2个作业
SET i = 1;
WHILE i <= 2 DO

INSERT INTO homeworks(title,description,department,creator_id,deadline,allow_late)
VALUES(CONCAT(dept,'作业',i),'完成课程相关作业',dept,teacher1,DATE_ADD(NOW(),INTERVAL 7 DAY),1);

SET hw = LAST_INSERT_ID();

-- 3个提交
INSERT INTO submissions(homework_id,student_id,content,is_late,score,is_excellent,reviewer_id,reviewed_at)
VALUES
(hw,s1,CONCAT('github.com/',dept,'/homework'),0,95,1,teacher1,NOW()),
(hw,s2,CONCAT('github.com/',dept,'/homework'),0,88,0,teacher1,NOW()),
(hw,s3,CONCAT('github.com/',dept,'/homework'),0,82,0,teacher1,NOW());

SET i = i + 1;

END WHILE;

SET i = 1;
WHILE i <= 2 DO

INSERT INTO homeworks(title,description,department,creator_id,deadline,allow_late)
VALUES(CONCAT(dept,'作业',i+2),'完成课程相关作业',dept,teacher2,DATE_ADD(NOW(),INTERVAL 7 DAY),1);

SET hw = LAST_INSERT_ID();

INSERT INTO submissions(homework_id,student_id,content,is_late,score,is_excellent,reviewer_id,reviewed_at)
VALUES
(hw,s1,CONCAT('github.com/',dept,'/homework'),0,93,1,teacher2,NOW()),
(hw,s2,CONCAT('github.com/',dept,'/homework'),0,87,0,teacher2,NOW()),
(hw,s3,CONCAT('github.com/',dept,'/homework'),0,80,0,teacher2,NOW());

SET i = i + 1;

END WHILE;

END LOOP;

CLOSE dept_cursor;

END$$

DELIMITER ;

-- =================================
-- 执行初始化
-- =================================

CALL init_homework_data();
use hoomework
update users set password = '$2a$10$lVXobnqPKsEjTIKxUA1VS.68EWSIC8NoW0r9jIdCJ.bxmgHpRG.MW' ;