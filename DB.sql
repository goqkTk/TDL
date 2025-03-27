-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS `tdl` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

USE `tdl`;

-- 문자셋 및 시간대 설정
SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET unique_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- 계정 테이블
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` varchar(20) NOT NULL,
  `pw` varchar(250) NOT NULL,
  `email` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 카테고리 테이블
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `order` int DEFAULT '9999',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 할 일 테이블
DROP TABLE IF EXISTS `todo`;
CREATE TABLE `todo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `title` text NOT NULL,
  `detail` text,
  `day` datetime NOT NULL,
  `success` tinyint DEFAULT '0',
  `favorite` tinyint DEFAULT '0',
  `order` int DEFAULT '9999',
  `order_favorite` int DEFAULT '9999',
  `edit_day` datetime DEFAULT NULL,
  `is_fixed` tinyint(1) DEFAULT '0',
  `success_day` datetime DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 캘린더 이벤트 테이블
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `notification` varchar(20) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `memo` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_dates` (`user_id`,`start_datetime`,`end_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 알림 테이블
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `notification_time` datetime DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `is_read` tinyint DEFAULT '0',
  `email_sent` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_event` (`user_id`,`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 이메일 인증 테이블
DROP TABLE IF EXISTS `email_verifications`;
CREATE TABLE `email_verifications` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT ((now() + interval 10 minute)),
  `used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`email`,`token`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 인증 코드 테이블
DROP TABLE IF EXISTS `verification_codes`;
CREATE TABLE `verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_user_expires` (`user_id`,`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 기본 데이터 삽입
INSERT INTO `account` VALUES 
('test','$2b$12$RqSoUpm1UUSWj6YShMJDfeJ1noloyM6ymMGvFAdjb.MIO8VX5Sp1m','jty_419@naver.com'),
('Admin','$2b$12$SZr89ngHmPguatUEO174B.rTvzcAGNkLdy60zeK6La1CLbDb4ll0S','tdlhelp02@gmail.com');

-- 설정 복원
SET foreign_key_checks = 1;
SET unique_checks = 1;
SET sql_mode = DEFAULT;
