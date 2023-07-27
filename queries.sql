CREATE TABLE `onelove`.`vaccination` (             --creation of vaccination table  
  `vaccination_id` INT NOT NULL AUTO_INCREMENT,
  `vaccine_name` VARCHAR(150) NULL,
  `date` VARCHAR(45) NULL,
  `dosage` VARCHAR(45) NULL,
  `cost` VARCHAR(45) NULL,
  PRIMARY KEY (`vaccination_id`)); 


  CREATE TABLE `onelove`.`items` (                 --creation of items table 
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_type` VARCHAR(45) NULL,
  `item_name` VARCHAR(45) NULL,
  `item_price` VARCHAR(45) NULL,
  `item_description` VARCHAR(199) NULL,
  `item_image` VARCHAR(1000) NULL,
  PRIMARY KEY (`item_id`));