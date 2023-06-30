-- MySQL dump 10.13  Distrib 8.0.23, for osx10.15 (x86_64)
--
-- Host: localhost    Database: COFFEE
-- ------------------------------------------------------
-- Server version	8.0.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `COFFEE`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `COFFEE` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `COFFEE`;

--
-- Table structure for table `beans`
--

DROP TABLE IF EXISTS `beans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `supplier_id` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beans`
--

LOCK TABLES `beans` WRITE;
/*!40000 ALTER TABLE `beans` DISABLE KEYS */;
INSERT INTO `beans` VALUES (1,1,'Arabica','Best bean','18.00','Delicious, smooth coffee.',1000),(2,1,'Robusta','Great bean','12.00','Full bodied, good to the last drop.',800),(3,2,'Robusta','Top bean','10.00','Great all around bean.',500),(4,2,'Liberica','Better bean','14.00','This bean stands above the rest.',600),(5,3,'Excelsa','Premiere bean','18.00','The best bean in all the land',200),(6,4,'Arabica','House bean','11.00','A solid performer.',900),(7,4,'Robusta','Quality bean','13.00','A great bean for daily use.',350),(8,5,'Robusta','Superb bean','16.00','No bean is better',700),(9,5,'Liberica','Top tier bean','15.00','The bean that impresses.',300),(10,6,'Arabica','Stellar bean','13.00','The top star of beans',300),(11,7,'Robusta','Terrific bean','12.00','This is a great bean',800),(12,7,'Liberica','Supreme bean','17.00','Solid performing bean.  Light roast for smooth taste.',700),(13,8,'Liberica','Ace bean','10.00','Medium roast bean.  Good for brewed coffee.',1000),(14,8,'Excelsa','Unrivaled bean','16.00','Dark roast bean.  Best for espresso.',300);
/*!40000 ALTER TABLE `beans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'AnyCompany coffee suppliers','123 Any Street','Any Town','WA','info@example.com','555-555-0100'),(2,'Central Example Corp. coffee','100 Main Street','Nowhere','CO','info@example.net','555-555-0101'),(3,'North East AnyCompany coffee suppliers','1001 Main Street','Any Town','NY','info@example.co','555-555-0102'),(4,'SE Example corp coffee suppliers','200 1st street','None city','GA','info@example.org','555-555-0103'),(5,'SW Example Corp. coffee','333 Main st','Anytown','AZ','info@example.me','555-555-0104'),(6,'Northern Example Corp. coffee','444 Main st','Not town','MN','coffee@example.com','555-555-0106'),(7,'West coast example Corp. coffee','1212 SE 30th Ave','Any beach','CA','coffee@example.coffee','555-555-0107'),(8,'Southern AnyCompany coffee suppliers','555 Main st','Anytown','TX','coffee@example.biz','555-555-0108');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-25 12:13:19
