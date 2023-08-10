CREATE TABLE `onelove`.`vaccination` (             
  `vaccination_id` INT NOT NULL AUTO_INCREMENT,
  `vaccine_name` VARCHAR(150) NULL,
  `date` VARCHAR(45) NULL, 
  `dosage` VARCHAR(45) NULL,
  `cost` VARCHAR(45) NULL, 
  PRIMARY KEY (`vaccination_id`));


  ALTER TABLE `onelove`.`vaccination`
ADD COLUMN `enddt` DATE NULL AFTER `cost`,
CHANGE COLUMN `vaccine_name` `vaccine_name` VARCHAR(150) NOT NULL ,
CHANGE COLUMN `date` `effdt` DATE NULL DEFAULT NULL ,
CHANGE COLUMN `cost` `cost` DECIMAL(8,2) NOT NULL ;


CREATE TABLE onelove.time (
        time_id INT PRIMARY KEY AUTO_INCREMENT,
        week_start_date DATE,
        week_end_date DATE,
        service_start_time TIME,
        service_end_time TIME
    );




CREATE TABLE onelove.images (
        image_id INT PRIMARY KEY AUTO_INCREMENT,
        image_type VARCHAR(50),
        image_url BLOB
    );




  CREATE TABLE `onelove`.`items` (                  
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_type` VARCHAR(45) NULL,
  `item_name` VARCHAR(45) NULL, 
  `item_price` VARCHAR(45) NULL, 
  `item_description` VARCHAR(199) NULL,
  `item_image` VARCHAR(1000) NULL,
  PRIMARY KEY (`item_id`));


  ALTER TABLE onelove.items
     MODIFY COLUMN item_name VARCHAR(45) NOT NULL,
     MODIFY COLUMN item_price VARCHAR(45) NOT NULL,
     MODIFY COLUMN item_description VARCHAR(500),
     DROP COLUMN item_image;


 ALTER TABLE onelove.items
     ADD COLUMN image_id INT,
     ADD CONSTRAINT fk_image_id
     FOREIGN KEY (image_id) REFERENCES onelove.images(image_id);




  CREATE TABLE `onelove`.`service` (
  `service_id` INT NOT NULL AUTO_INCREMENT, 
  `price` VARCHAR(45) NULL,
  `service_name` VARCHAR(45) NULL, 
  `start_time` VARCHAR(45) NULL, 
  `end_time` VARCHAR(45) NULL, 
  PRIMARY KEY (`service_id`)); 




  ALTER TABLE onelove.service
     DROP COLUMN start_time,
     DROP COLUMN end_time,
     ADD COLUMN service_description VARCHAR(999),
     CHANGE COLUMN price service_price DECIMAL(8, 2) NOT NULL,
     ADD COLUMN time_id INT,
     ADD CONSTRAINT fk_time_id
     FOREIGN KEY (time_id) REFERENCES onelove.time(time_id)




  CREATE TABLE `onelove`.`love_index` (
  `love_index_id` INT NOT NULL AUTO_INCREMENT,
  `love_tags` VARCHAR(45) NULL,
  `share` VARCHAR(45) NULL,
  `hoots` VARCHAR(999) NULL,
  PRIMARY KEY (`love_index_id`));




  CREATE TABLE `onelove`.`tracking` (
  `tracking_id` INT NOT NULL AUTO_INCREMENT,
  `shipping_address` VARCHAR(199) NULL, 
  `delivery_service` VARCHAR(45) NULL,
  PRIMARY KEY (`tracking_id`));


  ALTER TABLE onelove.tracking
     ADD COLUMN address_id INT,
     ADD CONSTRAINT fk_address_id
     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
     DROP COLUMN shipping_address,
     CHANGE COLUMN delivery_service delivery_service VARCHAR(200);




  CREATE TABLE `onelove`.`contact_details` (
  `contact_id` INT NOT NULL AUTO_INCREMENT,
  `mobile_number` VARCHAR(45) NULL, 
  `email` VARCHAR(45) NULL, 
  PRIMARY KEY (`contact_id`));


  ALTER TABLE onelove.contact_details
     MODIFY COLUMN mobile_number VARCHAR(45) NOT NULL,
     MODIFY COLUMN email VARCHAR(45) NOT NULL;




  CREATE TABLE `onelove`.`address` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(99) NULL, 
  `city` VARCHAR(45) NULL, 
  `state` VARCHAR(45) NULL,
  `zip` VARCHAR(45) NULL, 
  `country` VARCHAR(45) NULL, 
  PRIMARY KEY (`address_id`));


  ALTER TABLE onelove.address
     MODIFY COLUMN address VARCHAR(99) NOT NULL,
     MODIFY COLUMN city VARCHAR(45) NOT NULL,
     MODIFY COLUMN state VARCHAR(45) NOT NULL,
     MODIFY COLUMN zip VARCHAR(45) NOT NULL,
     MODIFY COLUMN country VARCHAR(45) NOT NULL,
     ADD COLUMN landmark VARCHAR(99) NULL,
     ADD COLUMN address_type VARCHAR(99) NOT NULL;




  CREATE TABLE onelove.posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    post_type VARCHAR(45),
    content VARCHAR(45), 
    image_or_video VARCHAR(45), 
    love_index_id INT,
    FOREIGN KEY (love_index_id) REFERENCES onelove.love_index(love_index_id)
);


ALTER TABLE onelove.posts
     CHANGE COLUMN content post_description VARCHAR(100),
     DROP COLUMN image_or_video,
     ADD COLUMN video VARCHAR(45);


ALTER TABLE onelove.posts
     ADD COLUMN image_id INT,
     ADD CONSTRAINT fk_image_id_new
     FOREIGN KEY (image_id) REFERENCES onelove.images(image_id);




CREATE TABLE onelove.pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_type VARCHAR(45),
    pet_name VARCHAR(45), 
    pet_breed VARCHAR(45),
    pet_gender VARCHAR(45),
    pet_profile VARCHAR(45),
    pet_weight VARCHAR(45),
    pet_description VARCHAR(199), 
    vaccination_id INT,
    FOREIGN KEY (vaccination_id) REFERENCES onelove.vaccination(vaccination_id)
);


ALTER TABLE onelove.pet
     MODIFY COLUMN pet_type VARCHAR(45) NOT NULL,
     MODIFY COLUMN pet_name VARCHAR(99) NOT NULL,
     DROP COLUMN pet_profile,
     ADD COLUMN pet_dob DATE;


ALTER TABLE onelove.pet
     ADD COLUMN image_id INT,
     ADD CONSTRAINT fk_image_id_pet
     FOREIGN KEY (image_id) REFERENCES onelove.images(image_id);




CREATE TABLE onelove.clinics (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_name VARCHAR(45),
    start_time VARCHAR(45), 
    end_time VARCHAR(45),
    specialisation VARCHAR(45),
    clinic_license VARCHAR(45),
    address_id INT,
    contact_id INT,
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id)
);




ALTER TABLE onelove.clinics
     MODIFY COLUMN clinic_name VARCHAR(99) NOT NULL,
     DROP COLUMN start_time,
     DROP COLUMN end_time,
     ADD COLUMN time_id INT,
     ADD CONSTRAINT fk_time_id_clinic
     FOREIGN KEY (time_id) REFERENCES onelove.time(time_id);




CREATE TABLE onelove.users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_type VARCHAR(45),
    address_id INT,
    contact_id INT,
    pet_id INT,
    post_id INT,
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id),
    FOREIGN KEY (pet_id) REFERENCES onelove.pet(pet_id),
    FOREIGN KEY (post_id) REFERENCES onelove.posts(post_id)
);


ALTER TABLE onelove.users
     MODIFY COLUMN user_type VARCHAR(45) NOT NULL,
     ADD COLUMN user_name VARCHAR(100) NOT NULL;




CREATE TABLE onelove.registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, 
    contact_id INt, 
    address_id INT, 
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id)
);


ALTER TABLE onelove.registrations
     ADD COLUMN image_id INT,
     ADD CONSTRAINT fk_image_id_reg
     FOREIGN KEY (image_id) REFERENCES onelove.images(image_id);




CREATE TABLE onelove.orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    quantity VARCHAR(45), 
    billing_address VARCHAR(99), 
    shipping_address VARCHAR(99), 
    order_status VARCHAR(45), 
    user_id INT,
    item_id INT,
    tracking_id INT, 
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (item_id) REFERENCES onelove.items(item_id),
    FOREIGN KEY (tracking_id) REFERENCES onelove.tracking(tracking_id)
);




ALTER TABLE onelove.users
ADD COLUMN order_id INT,
ADD FOREIGN KEY (order_id) REFERENCES onelove.orders(order_id);


ALTER TABLE onelove.orders
     CHANGE COLUMN quantity order_quantity VARCHAR(45) NOT NULL,
     MODIFY COLUMN order_status VARCHAR(45) NOT NULL,
     DROP COLUMN billing_address,
     DROP COLUMN shipping_address,
     ADD COLUMN address_id INT,
     ADD CONSTRAINT fk_address_id_orders
     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id);




CREATE TABLE onelove.payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    amount VARCHAR(45),
    payment_type VARCHAR(45),
    date_time VARCHAR(45),
    payment_status VARCHAR(45), 
    order_id INT,
    FOREIGN KEY (order_id) REFERENCES onelove.orders(order_id)
);


ALTER TABLE onelove.payments
     MODIFY COLUMN amount DECIMAL(8,2),
     MODIFY COLUMN date_time DATETIME,
     ADD COLUMN address_id INT,
     ADD CONSTRAINT fk_address_id_payment
     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id);


ALTER TABLE onelove.orders
ADD COLUMN payment_id INT, 
ADD FOREIGN KEY (payment_id) REFERENCES onelove.payments(payment_id);




CREATE TABLE onelove.store (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    discounts VARCHAR(45),
    item_id INT,
    address_id INT,
    order_id INT,
    payment_id INT,
    FOREIGN KEY (item_id) REFERENCES onelove.items(item_id),
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (order_id) REFERENCES onelove.orders(order_id),
    FOREIGN KEY (payment_id) REFERENCES onelove.payments(payment_id)
);


ALTER TABLE onelove.store
ADD COLUMN store_name VARCHAR(99) NOT NULL AFTER store_id;




CREATE TABLE onelove.inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_status VARCHAR(45), 
    item_quantity VARCHAR(45),
    quality VARCHAR(45),
    store_id INT,
    user_id INT,
    item_id INT,
    FOREIGN KEY (store_id) REFERENCES onelove.store(store_id),
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (item_id) REFERENCES onelove.items(item_id)
);




ALTER TABLE onelove.store
ADD COLUMN inventory_id INT,
ADD FOREIGN KEY (inventory_id) REFERENCES onelove.inventory(inventory_id);


ALTER TABLE onelove.inventory
     ADD COLUMN address_id INT,
     ADD CONSTRAINT fk_address_id_inventory
     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id);




CREATE TABLE onelove.pet_trainer (
    pet_trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_id INT,
    contact_id INT,
    service_id INT,
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id),
    FOREIGN KEY (service_id) REFERENCES onelove.service(service_id)
);


ALTER TABLE `onelove`.`pet_trainer`
DROP FOREIGN KEY `pet_trainer_ibfk_1`,
DROP FOREIGN KEY `pet_trainer_ibfk_2`,
DROP FOREIGN KEY `pet_trainer_ibfk_3`,
DROP FOREIGN KEY `pet_trainer_ibfk_4`;
ALTER TABLE `onelove`.`pet_trainer`
CHANGE COLUMN `user_id` `user_id` INT NOT NULL ,
CHANGE COLUMN `address_id` `address_id` INT NOT NULL ,
CHANGE COLUMN `contact_id` `contact_id` INT NOT NULL ,
CHANGE COLUMN `service_id` `service_id` INT NOT NULL ;
ALTER TABLE `onelove`.`pet_trainer`
ADD CONSTRAINT `pet_trainer_ibfk_1`
  FOREIGN KEY (`user_id`)
  REFERENCES `onelove`.`users` (`user_id`),
ADD CONSTRAINT `pet_trainer_ibfk_2`
  FOREIGN KEY (`address_id`)
  REFERENCES `onelove`.`address` (`address_id`),
ADD CONSTRAINT `pet_trainer_ibfk_3`
  FOREIGN KEY (`contact_id`)
  REFERENCES `onelove`.`contact_details` (`contact_id`),
ADD CONSTRAINT `pet_trainer_ibfk_4`
  FOREIGN KEY (`service_id`)
  REFERENCES `onelove`.`service` (`service_id`);






select p.*, v.*, i.* from onelove.pet p, onelove.vaccination v, onelove.image i;
select p.pet_id, p.pet_name, p.pet_gender, ...
select p.*, v.* from onelove.pet p, onelove.vaccination v where p.vaccination_id = v.vaccination_id;


select i.* from images i where i.image_id in (select  p.image_id from pets p where p.pet_id = <petId>);


     `
     INSERT INTO onelove.pet
     (pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, vaccination_id, pet_dob, image_id)
     VALUES
     ("${pet_type}", "${pet_name}", "${pet_breed}", "${pet_gender}", "${pet_weight}", "${pet_description}",
     ${vaccination_id === undefined ? 'NULL' : vaccination_id}, "${pet_dob}", ${image_id === undefined ? 'NULL' : image_id})`;
