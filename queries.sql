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

ALTER TABLE `onelove`.`time` 
CHANGE COLUMN `week_start_date` `week_start_day` VARCHAR(45) NULL DEFAULT NULL ,
CHANGE COLUMN `week_end_date` `week_end_day` VARCHAR(45) NULL DEFAULT NULL ;




CREATE TABLE onelove.images (
        image_id INT PRIMARY KEY AUTO_INCREMENT,
        image_type VARCHAR(50),
        image_url BLOB
    );

ALTER TABLE `onelove`.`images` 
CHANGE COLUMN `image_url` `image_url` VARCHAR(60000) NULL DEFAULT NULL ;



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

ALTER TABLE items
DROP COLUMN item_type,
DROP COLUMN item_name,
DROP COLUMN item_price;

ALTER TABLE items
ADD COLUMN brand_name varchar(99) AFTER item_id,
ADD COLUMN product_title varchar(99) AFTER brand_name,
ADD COLUMN product_details varchar(999);


ALTER TABLE items
ADD COLUMN sub_cate_id INT,
ADD CONSTRAINT fk_items_sub_category FOREIGN KEY (sub_cate_id) REFERENCES sub_category(sub_cate_id),
ADD COLUMN store_id INT,
ADD CONSTRAINT fk_items_store FOREIGN KEY (store_id) REFERENCES store(store_id),
ADD COLUMN image_id INT,
ADD CONSTRAINT fk_items_images FOREIGN KEY (image_id) REFERENCES images(image_id);

ALTER TABLE quantity
ADD CONSTRAINT fk_item_id
FOREIGN KEY (item_id) REFERENCES items(item_id)
ON DELETE CASCADE;

ALTER TABLE `onelove`.`items` 
ADD COLUMN `quantity` JSON NULL


CREATE TABLE quantity (
    quantity_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    quantity_type VARCHAR(45),
    quantity VARCHAR(45),
    mrp INT,
    discount INT,
    total_price INT,
    item_id INT,
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);



CREATE TABLE onelove.service (
    service_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    service_price DECIMAL(8, 2) NOT NULL,
    service_name VARCHAR(45),
    service_description VARCHAR(999),
    time_id INT(11),
    user_id INT(11),
    FOREIGN KEY (time_id) REFERENCES onelove.time(time_id),
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id)
);

ALTER TABLE onelove.service
DROP COLUMN service_price,
DROP COLUMN service_name,
DROP COLUMN service_description,
ADD COLUMN pet_walking BOOLEAN,
ADD COLUMN pet_sitting BOOLEAN,
ADD COLUMN pet_boarding BOOLEAN,
ADD COLUMN event_training BOOLEAN,
ADD COLUMN training_workshop BOOLEAN,
ADD COLUMN adoption_drives BOOLEAN,
ADD COLUMN pet_intelligence_rank_card BOOLEAN,
ADD COLUMN pet_grooming BOOLEAN;

ALTER TABLE `onelove`.`service` 
ADD COLUMN `trainer_experience` VARCHAR(45) NULL AFTER `pet_grooming`;

ALTER TABLE `onelove`.`service` 
DROP FOREIGN KEY `service_ibfk_2`;
ALTER TABLE `onelove`.`service` 
DROP COLUMN `user_id`,
DROP INDEX `user_id` ;
;

ALTER TABLE `onelove`.`service` 
DROP FOREIGN KEY `service_ibfk_1`;
ALTER TABLE `onelove`.`service` 
DROP COLUMN `time_id`,
ADD COLUMN `service_start_day` VARCHAR(45) NULL AFTER `trainer_experience`,
ADD COLUMN `service_end_day` VARCHAR(45) NULL AFTER `service_start_day`,
DROP INDEX `time_id` ;
;

ALTER TABLE `onelove`.`service` 
ADD COLUMN `service_start_time` time NULL,
ADD COLUMN `service_end_time` time NULL;

  CREATE TABLE `onelove`.`love_index` (
  `love_index_id` INT NOT NULL AUTO_INCREMENT,
  `love_tags` VARCHAR(45) NULL,
  `share` VARCHAR(45) NULL,
  `hoots` VARCHAR(999) NULL,
  PRIMARY KEY (`love_index_id`));

ALTER TABLE love_index
ADD COLUMN post_id INT(11),
ADD FOREIGN KEY (post_id) REFERENCES posts(post_id);


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
    post_description VARCHAR(100), 
    video VARCHAR(45),
    love_index_id INT,
    image_id INT,
    user_id INT NOT NULL,
    FOREIGN KEY (love_index_id) REFERENCES onelove.love_index(love_index_id),
    FOREIGN KEY (image_id) REFERENCES onelove.images(image_id),
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id)
);

ALTER TABLE onelove.posts
ADD COLUMN pet_id INT,
ADD FOREIGN KEY (pet_id) REFERENCES onelove.pet(pet_id);

ALTER TABLE onelove.posts
ADD COLUMN video_id INT,
ADD FOREIGN KEY (video_id) REFERENCES onelove.videos(video_id);




CREATE TABLE onelove.pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_type VARCHAR(45) NOT NULL,
    pet_name VARCHAR(99) NOT NULL, 
    pet_breed VARCHAR(45),
    pet_gender VARCHAR(45),
    pet_weight VARCHAR(45),
    pet_description VARCHAR(199), 
    vaccination_id INT,
    pet_dob date DEFAULT NULL,
    image_id INT,
    user_id INT NOT NULL,
    FOREIGN KEY (vaccination_id) REFERENCES onelove.vaccination(vaccination_id),
    FOREIGN KEY (image_id) REFERENCES onelove.images(image_id),
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id)
);

ALTER TABLE `onelove`.`pet` 
ADD COLUMN `spay_neuter` VARCHAR(45) NULL AFTER `user_id`;

CREATE TABLE `onelove`.`videos` (
  `video_id` INT NOT NULL AUTO_INCREMENT,
  `video_type` VARCHAR(45) NULL,
  `video_url` JSON NULL,
  PRIMARY KEY (`video_id`));


CREATE TABLE clinics (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_name VARCHAR(99) NOT NULL,
    specialisation VARCHAR(45),
    clinic_license VARCHAR(45),
    time_id INT,
    user_id INT,
    CONSTRAINT fk_clinics_time FOREIGN KEY (time_id) REFERENCES time(time_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_clinics_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);



ALTER TABLE `onelove`.`clinics` 
ADD COLUMN `experience` VARCHAR(45) NULL AFTER `clinic_license`,
ADD COLUMN `education` VARCHAR(45) NULL AFTER `experience`;

ALTER TABLE `onelove`.`clinics` 
DROP FOREIGN KEY `fk_clinics_user`;
ALTER TABLE `onelove`.`clinics` 
DROP COLUMN `user_id`,
DROP INDEX `fk_clinics_user` ;
;

ALTER TABLE `onelove`.`clinics` 
DROP FOREIGN KEY `fk_clinics_time`;
ALTER TABLE `onelove`.`clinics` 
DROP COLUMN `time_id`,
ADD COLUMN `week_start_day` VARCHAR(45) NULL AFTER `education`,
ADD COLUMN `week_end_day` VARCHAR(45) NULL AFTER `week_start_day`,
DROP INDEX `fk_clinics_time` ;
;

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


ALTER TABLE onelove.users
     ADD COLUMN store_id INT,
     ADD COLUMN service_id INT,
     ADD COLUMN clinic_id INT,
     ADD FOREIGN KEY (store_id) REFERENCES onelove.store(store_id),
     ADD FOREIGN KEY (service_id) REFERENCES onelove.service(service_id),
     ADD FOREIGN KEY (clinic_id) REFERENCES onelove.clinics(clinic_id);

     

ALTER TABLE `onelove`.`users` 
DROP FOREIGN KEY `users_ibfk_4`,
DROP FOREIGN KEY `users_ibfk_3`;
ALTER TABLE `onelove`.`users` 
DROP COLUMN `post_id`,
DROP COLUMN `pet_id`,
DROP INDEX `post_id` ,
DROP INDEX `pet_id` ;
;


ALTER TABLE `onelove`.`users` 
DROP FOREIGN KEY `users_ibfk_5`;
ALTER TABLE `onelove`.`users` 
DROP COLUMN `order_id`,
DROP INDEX `order_id` ;
;



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

ALTER TABLE `onelove`.`orders` 
DROP FOREIGN KEY `orders_ibfk_4`,
DROP FOREIGN KEY `orders_ibfk_3`,
DROP FOREIGN KEY `orders_ibfk_2`,
DROP FOREIGN KEY `fk_address_id_orders`;
ALTER TABLE `onelove`.`orders` 
DROP COLUMN `payment_id`,
DROP COLUMN `address_id`,
DROP COLUMN `tracking_id`,
DROP COLUMN `item_id`,
DROP COLUMN `order_status`,
DROP COLUMN `order_quantity`,
DROP INDEX `payment_id` ,
DROP INDEX `fk_address_id_orders` ,
DROP INDEX `tracking_id` ,
DROP INDEX `item_id` ;
;


ALTER TABLE onelove.orders
ADD COLUMN store_id INT,
ADD FOREIGN KEY (store_id) REFERENCES onelove.store(store_id)
ADD COLUMN orders JSON
ADD COLUMN order_no VARCHAR(45);




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


ALTER TABLE `onelove`.`store` 
DROP FOREIGN KEY `store_ibfk_2`;
ALTER TABLE `onelove`.`store` 
DROP COLUMN `address_id`,
DROP INDEX `address_id` ;
;




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
  

ALTER TABLE store
         ADD COLUMN address_id int(11),
         ADD COLUMN contact_id int(11),
         ADD CONSTRAINT fk_store_address
         FOREIGN KEY (address_id) REFERENCES address(address_id),
         ADD CONSTRAINT fk_store_contact
         FOREIGN KEY (contact_id) REFERENCES contact_details(contact_id);  

ALTER TABLE `onelove`.`store` 
ADD COLUMN `food_treats` TINYINT NULL AFTER `contact_id`,
ADD COLUMN `accessories` TINYINT NULL AFTER `food_treats`,
ADD COLUMN `toys` TINYINT NULL AFTER `accessories`,
ADD COLUMN `health_care` TINYINT NULL AFTER `toys`,
ADD COLUMN `dog_service` TINYINT NULL AFTER `health_care`,
ADD COLUMN `breader_adoption_sale` TINYINT NULL AFTER `dog_service`;


CREATE TABLE onelove.sub_category (
    sub_cate_id INT(11) NOT NULL AUTO_INCREMENT,
    collection_name VARCHAR(99),
    sub_category_name VARCHAR(99),
    products_count INT,
    store_id INT(11),
    PRIMARY KEY (sub_cate_id),
    FOREIGN KEY (store_id) REFERENCES onelove.store(store_id)
);

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


CREATE TABLE rating_review (
  rate_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  ratings JSON,
  reviews JSON,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
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


