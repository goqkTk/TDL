CREATE DATABASE  IF NOT EXISTS `tdl` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tdl`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: tdl
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(20) NOT NULL,
  `pw` varchar(250) NOT NULL,
  `email` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('test','$2b$12$RqSoUpm1UUSWj6YShMJDfeJ1noloyM6ymMGvFAdjb.MIO8VX5Sp1m','jty_419@naver.com'),('Admin','$2b$12$SZr89ngHmPguatUEO174B.rTvzcAGNkLdy60zeK6La1CLbDb4ll0S','tdlhelp02@gmail.com');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
INSERT INTO `calendar_events` VALUES (1,'Admin','11111','2024-12-02 10:00:00','2024-12-03 11:00:00','none','','','2024-12-04 09:29:17'),(2,'Admin','22222','2024-12-05 10:00:00','2024-12-06 11:00:00','none','','','2024-12-04 09:29:30'),(3,'Admin','3333','2024-12-06 10:00:00','2024-12-07 11:00:00','none','','','2024-12-04 09:29:42'),(4,'Admin','11234','2024-12-12 10:00:00','2024-12-14 11:00:00','none','','','2024-12-04 10:05:01'),(5,'Admin','asdf','2024-12-13 10:00:00','2024-12-13 11:00:00','none','','','2024-12-04 10:08:35'),(6,'Admin','1','2024-12-16 10:00:00','2024-12-18 11:00:00','none','','','2024-12-04 10:18:42'),(7,'Admin','2','2024-12-17 10:00:00','2024-12-19 11:00:00','none','','','2024-12-04 10:18:55'),(9,'Admin','3','2024-12-19 10:00:00','2024-12-20 11:00:00','none','','','2024-12-04 11:47:29'),(11,'Admin','5','2024-12-17 10:00:00','2024-12-18 11:00:00','none','','','2024-12-04 11:47:56'),(12,'Admin','11','2024-12-08 10:00:00','2024-12-08 11:00:00','none','','','2024-12-04 11:48:39'),(13,'Admin','22','2024-12-08 10:00:00','2024-12-08 11:00:00','none','','','2024-12-04 11:48:41'),(14,'Admin','33','2024-12-08 10:00:00','2024-12-08 11:00:00','none','','','2024-12-04 11:48:43'),(15,'Admin','44','2024-12-08 10:00:00','2024-12-08 11:00:00','none','','','2024-12-04 11:48:45'),(17,'Admin','55','2024-12-08 10:00:00','2024-12-08 11:00:00','none','','','2024-12-04 11:49:07'),(22,'Admin','4','2024-12-18 10:00:00','2024-12-20 11:00:00','none','','','2024-12-04 15:54:23'),(49,'Admin','일정','2024-12-13 11:25:00','2024-12-13 11:30:00','10min','','','2024-12-13 11:14:00'),(50,'Admin','일정1','2024-12-13 13:40:00','2024-12-13 13:45:00','10min','','','2024-12-13 13:38:49');
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `order` int DEFAULT '9999',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (14,'test','test',0,'2024-10-18 08:21:42',0),(21,'test','test1',0,'2024-10-23 10:29:47',1),(32,'test','test2',0,'2024-11-10 12:59:32',2),(34,'Admin','test',0,'2024-11-11 05:59:23',0),(35,'Admin','test1',0,'2024-11-11 05:59:52',1),(36,'Admin','test2',0,'2024-11-11 05:59:57',2);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT ((now() + interval 10 minute)),
  `used` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
INSERT INTO `email_verifications` VALUES ('jty_419@naver.com','Wxjp2DNPrCOm9cRQl0RpPw9r0UH-jSmNL_eEggs3WM4','2024-09-11 01:03:18','2024-09-11 10:13:18',1),('tdlhelp02@gmail.com','nCpv_I-Vxzc8LOCcFNvNUFVvQIf-2t-V6O0TBqm-9FU','2024-09-11 01:04:21','2024-09-11 10:14:21',1),('simik1082@gmail.com','l1ENvkx2eN16xqFkxcHCJAO8UXTxnNv4wVp-8VQx_9s','2024-10-14 04:58:49','2024-10-14 14:08:49',1),('goqkTk1986@gmail.com','qbPl-PpSnWtXO8mxSUOolO8Q0XthU94JH13W0Wm_e8w','2024-11-17 05:13:13','2024-11-17 14:23:13',0),('goqkTk1986@gmail.com','J1DVZDHejcGIXlPJdhB9SI7Gpd-u4Vr4cHN3y8zFk1o','2024-11-17 05:25:55','2024-11-17 14:35:55',0),('goqkTk1986@gmail.com','L1lUCimQo8Ckv8yURZzPvuCoRJMTtGQSchMgF_MaVk0','2024-11-17 05:36:13','2024-11-17 14:46:13',1),('goqkTk1986@gmail.com','DeKXzhIieUbs_SravdDctHqBinLxCA_yZDrTQ1hzJcw','2024-11-17 05:43:33','2024-11-17 14:53:33',0),('goqkTk1986@gmail.com','LmQAg4NwHJlNnbFOO2EayPEjCnsKlrZf0je5DaY_Hts','2024-11-17 06:04:08','2024-11-17 15:14:08',0),('goqkTk1986@gmail.com','6nhUijLJn3cLj5Ykf2MJkt2U4P76GONzofxMgWDWcew','2024-11-17 06:16:34','2024-11-17 15:26:34',1);
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `notification_time` datetime DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Admin',38,'일정','2024-12-11 21:40:00','2024-12-11 21:50:00',0,'2024-12-11 21:39:18'),(2,'Admin',39,'일정','2024-12-11 21:45:00','2024-12-11 21:55:00',0,'2024-12-11 21:41:19'),(3,'Admin',40,'일정','2024-12-11 21:55:00','2024-12-11 22:05:00',0,'2024-12-11 21:54:12'),(4,'Admin',41,'일정','2024-12-11 22:00:00','2024-12-11 22:10:00',0,'2024-12-11 21:58:34'),(5,'Admin',42,'일정','2024-12-11 22:05:00','2024-12-11 22:15:00',1,'2024-12-11 22:02:07'),(6,'Admin',43,'일정','2024-12-12 08:35:00','2024-12-12 08:45:00',0,'2024-12-12 08:30:25'),(7,'Admin',44,'일정','2024-12-12 08:55:00','2024-12-12 09:05:00',0,'2024-12-12 08:49:27'),(9,'Admin',46,'일정','2024-12-13 09:25:00','2024-12-13 09:35:00',0,'2024-12-13 09:22:00'),(11,'Admin',49,'일정','2024-12-13 11:15:00','2024-12-13 11:25:00',1,'2024-12-13 11:14:00'),(12,'Admin',50,'일정1','2024-12-13 13:30:00','2024-12-13 13:40:00',0,'2024-12-13 13:38:49');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `todo`
--

DROP TABLE IF EXISTS `todo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  KEY `fk_category` (`category_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `todo`
--

LOCK TABLES `todo` WRITE;
/*!40000 ALTER TABLE `todo` DISABLE KEYS */;
INSERT INTO `todo` VALUES (27,'test','test 카테고리 1','','2024-10-21 13:49:06',0,1,0,1,NULL,0,NULL,14),(28,'test','test 카테고리 2','22222','2024-10-21 13:49:14',0,0,1,9999,NULL,0,NULL,14),(41,'test','메인 카테고리 1','','2024-10-25 23:53:18',0,1,NULL,0,NULL,1,NULL,NULL),(42,'test','메인 카테고리 2','22222','2024-10-25 23:53:27',0,0,0,9999,NULL,0,NULL,NULL),(54,'Admin','test 카테고리 1','test1','2024-11-11 15:00:17',0,1,0,NULL,NULL,0,NULL,34),(55,'Admin','test 카테고리 2','test2','2024-11-11 15:00:26',0,0,1,9999,NULL,0,NULL,34),(56,'Admin','메인 카테고리 1','','2024-11-11 15:00:40',0,1,NULL,0,NULL,1,NULL,NULL),(57,'Admin','메인 카테고리 2','','2024-11-11 15:00:50',0,0,0,9999,NULL,0,NULL,NULL),(58,'test','컴퓨터 TDL 계정 로그인하기','','2024-11-17 17:21:55',0,0,1,9999,NULL,0,NULL,NULL),(60,'Admin','컴퓨터 TDL 계정 로그인','','2024-11-17 17:22:51',0,0,1,9999,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `todo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_codes`
--

DROP TABLE IF EXISTS `verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_codes`
--

LOCK TABLES `verification_codes` WRITE;
/*!40000 ALTER TABLE `verification_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'tdl'
--

--
-- Dumping routines for database 'tdl'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-17  8:44:11
