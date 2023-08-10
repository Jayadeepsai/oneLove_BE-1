-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: onelove
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(99) NOT NULL,
  `city` varchar(45) NOT NULL,
  `state` varchar(45) NOT NULL,
  `zip` varchar(45) NOT NULL,
  `country` varchar(45) NOT NULL,
  `landmark` varchar(99) DEFAULT NULL,
  `address_type` varchar(99) NOT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clinics`
--

DROP TABLE IF EXISTS `clinics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinics` (
  `clinic_id` int NOT NULL AUTO_INCREMENT,
  `clinic_name` varchar(99) NOT NULL,
  `specialisation` varchar(45) DEFAULT NULL,
  `clinic_license` varchar(45) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `contact_id` int DEFAULT NULL,
  `time_id` int DEFAULT NULL,
  PRIMARY KEY (`clinic_id`),
  KEY `address_id` (`address_id`),
  KEY `contact_id` (`contact_id`),
  KEY `fk_time_id_clinic` (`time_id`),
  CONSTRAINT `clinics_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `clinics_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contact_details` (`contact_id`),
  CONSTRAINT `fk_time_id_clinic` FOREIGN KEY (`time_id`) REFERENCES `time` (`time_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_details`
--

DROP TABLE IF EXISTS `contact_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_details` (
  `contact_id` int NOT NULL AUTO_INCREMENT,
  `mobile_number` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `image_type` varchar(50) DEFAULT NULL,
  `image_url` blob,
  PRIMARY KEY (`image_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `item_status` varchar(45) DEFAULT NULL,
  `item_quantity` varchar(45) DEFAULT NULL,
  `quality` varchar(45) DEFAULT NULL,
  `store_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `store_id` (`store_id`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  KEY `fk_address_id_inventory` (`address_id`),
  CONSTRAINT `fk_address_id_inventory` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`),
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_type` varchar(45) DEFAULT NULL,
  `item_name` varchar(45) NOT NULL,
  `item_price` varchar(45) NOT NULL,
  `item_description` varchar(500) DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_image_id` (`image_id`),
  CONSTRAINT `fk_image_id` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `love_index`
--

DROP TABLE IF EXISTS `love_index`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `love_index` (
  `love_index_id` int NOT NULL AUTO_INCREMENT,
  `love_tags` varchar(45) DEFAULT NULL,
  `share` varchar(45) DEFAULT NULL,
  `hoots` varchar(999) DEFAULT NULL,
  PRIMARY KEY (`love_index_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_quantity` varchar(45) NOT NULL,
  `order_status` varchar(45) NOT NULL,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `tracking_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `tracking_id` (`tracking_id`),
  KEY `payment_id` (`payment_id`),
  KEY `fk_address_id_orders` (`address_id`),
  KEY `orders_ibfk_1` (`user_id`),
  KEY `orders_ibfk_2` (`item_id`),
  CONSTRAINT `fk_address_id_orders` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`tracking_id`) REFERENCES `tracking` (`tracking_id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(8,2) DEFAULT NULL,
  `payment_type` varchar(45) DEFAULT NULL,
  `date_time` datetime DEFAULT NULL,
  `payment_status` varchar(45) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  KEY `fk_address_id_payment` (`address_id`),
  CONSTRAINT `fk_address_id_payment` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pet`
--

DROP TABLE IF EXISTS `pet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet` (
  `pet_id` int NOT NULL AUTO_INCREMENT,
  `pet_type` varchar(45) NOT NULL,
  `pet_name` varchar(99) NOT NULL,
  `pet_breed` varchar(45) DEFAULT NULL,
  `pet_gender` varchar(45) DEFAULT NULL,
  `pet_weight` varchar(45) DEFAULT NULL,
  `pet_description` varchar(199) DEFAULT NULL,
  `vaccination_id` int DEFAULT NULL,
  `pet_dob` date DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`pet_id`),
  KEY `vaccination_id` (`vaccination_id`),
  KEY `fk_image_id_pet` (`image_id`),
  CONSTRAINT `fk_image_id_pet` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`),
  CONSTRAINT `pet_ibfk_1` FOREIGN KEY (`vaccination_id`) REFERENCES `vaccination` (`vaccination_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pet_trainer`
--

DROP TABLE IF EXISTS `pet_trainer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_trainer` (
  `pet_trainer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address_id` int NOT NULL,
  `contact_id` int NOT NULL,
  `service_id` int NOT NULL,
  PRIMARY KEY (`pet_trainer_id`),
  KEY `pet_trainer_ibfk_1` (`user_id`),
  KEY `pet_trainer_ibfk_2` (`address_id`),
  KEY `pet_trainer_ibfk_3` (`contact_id`),
  KEY `pet_trainer_ibfk_4` (`service_id`),
  CONSTRAINT `pet_trainer_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `pet_trainer_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `pet_trainer_ibfk_3` FOREIGN KEY (`contact_id`) REFERENCES `contact_details` (`contact_id`),
  CONSTRAINT `pet_trainer_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `post_type` varchar(45) DEFAULT NULL,
  `post_description` varchar(100) DEFAULT NULL,
  `love_index_id` int DEFAULT NULL,
  `video` varchar(45) DEFAULT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `love_index_id` (`love_index_id`),
  KEY `fk_image_id_new` (`image_id`),
  CONSTRAINT `fk_image_id_new` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`love_index_id`) REFERENCES `love_index` (`love_index_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registrations`
--

DROP TABLE IF EXISTS `registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrations` (
  `reg_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contact_id` int NOT NULL,
  `address_id` int NOT NULL,
  `image_id` int DEFAULT NULL,
  PRIMARY KEY (`reg_id`),
  KEY `registrations_ibfk_1` (`user_id`),
  KEY `registrations_ibfk_2` (`address_id`),
  KEY `registrations_ibfk_3` (`contact_id`),
  KEY `fk_image_id_reg` (`image_id`),
  CONSTRAINT `fk_image_id_reg` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `registrations_ibfk_3` FOREIGN KEY (`contact_id`) REFERENCES `contact_details` (`contact_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_price` decimal(8,2) NOT NULL,
  `service_name` varchar(45) DEFAULT NULL,
  `service_description` varchar(999) DEFAULT NULL,
  `time_id` int DEFAULT NULL,
  PRIMARY KEY (`service_id`),
  KEY `fk_time_id` (`time_id`),
  CONSTRAINT `fk_time_id` FOREIGN KEY (`time_id`) REFERENCES `time` (`time_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(99) NOT NULL,
  `discounts` varchar(45) DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `address_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `inventory_id` int DEFAULT NULL,
  PRIMARY KEY (`store_id`),
  KEY `item_id` (`item_id`),
  KEY `order_id` (`order_id`),
  KEY `payment_id` (`payment_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `store_ibfk_2` (`address_id`),
  CONSTRAINT `store_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`),
  CONSTRAINT `store_ibfk_2` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `store_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `store_ibfk_4` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `store_ibfk_5` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `time`
--

DROP TABLE IF EXISTS `time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time` (
  `time_id` int NOT NULL AUTO_INCREMENT,
  `week_start_date` date DEFAULT NULL,
  `week_end_date` date DEFAULT NULL,
  `service_start_time` time DEFAULT NULL,
  `service_end_time` time DEFAULT NULL,
  PRIMARY KEY (`time_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tracking`
--

DROP TABLE IF EXISTS `tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking` (
  `tracking_id` int NOT NULL AUTO_INCREMENT,
  `delivery_service` varchar(200) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  PRIMARY KEY (`tracking_id`),
  KEY `fk_address_id` (`address_id`),
  CONSTRAINT `fk_address_id` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_type` varchar(45) NOT NULL,
  `address_id` int DEFAULT NULL,
  `contact_id` int DEFAULT NULL,
  `pet_id` int DEFAULT NULL,
  `post_id` int DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `user_name` varchar(100) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `address_id` (`address_id`),
  KEY `contact_id` (`contact_id`),
  KEY `pet_id` (`pet_id`),
  KEY `post_id` (`post_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `address` (`address_id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contact_details` (`contact_id`),
  CONSTRAINT `users_ibfk_3` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`pet_id`),
  CONSTRAINT `users_ibfk_4` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`),
  CONSTRAINT `users_ibfk_5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vaccination`
--

DROP TABLE IF EXISTS `vaccination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vaccination` (
  `vaccination_id` int NOT NULL AUTO_INCREMENT,
  `vaccine_name` varchar(150) NOT NULL,
  `effdt` date DEFAULT NULL,
  `dosage` varchar(45) DEFAULT NULL,
  `cost` decimal(8,2) NOT NULL,
  `enddt` date DEFAULT NULL,
  PRIMARY KEY (`vaccination_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-31 11:00:31
