CREATE TABLE `onelove`.`vaccination` (             --creation of vaccination table  
  `vaccination_id` INT NOT NULL AUTO_INCREMENT,
  `vaccineName` VARCHAR(150) NULL,
  `date` VARCHAR(45) NULL,
  `dosage` VARCHAR(45) NULL,
  `cost` VARCHAR(45) NULL,
  PRIMARY KEY (`vaccination_id`)); 


  CREATE TABLE `onelove`.`items` (                 --creation of items table 
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `itemType` VARCHAR(45) NULL,
  `itemName` VARCHAR(45) NULL,
  `itemPrice` VARCHAR(45) NULL,
  `itemDescription` VARCHAR(199) NULL,
  `itemImage` VARCHAR(1000) NULL,
  PRIMARY KEY (`item_id`));