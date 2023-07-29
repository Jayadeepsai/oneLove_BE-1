CREATE TABLE `onelove`.`vaccination` (             --creation of vaccination table  
  `vaccination_id` INT NOT NULL AUTO_INCREMENT,
  `vaccine_name` VARCHAR(150) NULL, --notnull
  `date` VARCHAR(45) NULL, -- date datatype effdt and enddt default sysdate to effdt,enddt will be +60 of effdt
  `dosage` VARCHAR(45) NULL, 
  `cost` VARCHAR(45) NULL, --change to double with precition 2 decimal places
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


  CREATE TABLE `onelove`.`items` (                 --creation of items table 
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `item_type` VARCHAR(45) NULL,
  `item_name` VARCHAR(45) NULL, -- notnull
  `item_price` VARCHAR(45) NULL, --notnull
  `item_description` VARCHAR(199) NULL, --500 varchar
  `item_image` VARCHAR(1000) NULL, --blob
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
  `service_id` INT NOT NULL AUTO_INCREMENT, --new column service_description
  `price` VARCHAR(45) NULL, --notnull service_price
  `service_name` VARCHAR(45) NULL, --notnull
  `start_time` VARCHAR(45) NULL, -- dateTime as datatype
  `end_time` VARCHAR(45) NULL, -- dateTime as datatype
  PRIMARY KEY (`service_id`)); --new table called time -- columns should be time_id, week_start_date(date), week_end_date(date) and  servive_start_time(time) and service_end_time(time)


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
  `hoots` VARCHAR(999) NULL,--comments
  PRIMARY KEY (`love_index_id`));


  CREATE TABLE `onelove`.`tracking` (
  `tracking_id` INT NOT NULL AUTO_INCREMENT,
  `shipping_address` VARCHAR(199) NULL, --replaced with address_id
  `delivery_service` VARCHAR(45) NULL,--varchar 200
  PRIMARY KEY (`tracking_id`));

  ALTER TABLE onelove.tracking
     ADD COLUMN address_id INT,
     ADD CONSTRAINT fk_address_id
     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
     DROP COLUMN shipping_address,
     CHANGE COLUMN delivery_service delivery_service VARCHAR(200);


  CREATE TABLE `onelove`.`contact_details` (
  `contact_id` INT NOT NULL AUTO_INCREMENT,
  `mobile_number` VARCHAR(45) NULL, --notnull
  `email` VARCHAR(45) NULL, --notnull
  PRIMARY KEY (`contact_id`));

  ALTER TABLE onelove.contact_details
     MODIFY COLUMN mobile_number VARCHAR(45) NOT NULL,
     MODIFY COLUMN email VARCHAR(45) NOT NULL;


  CREATE TABLE `onelove`.`address` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(99) NULL, --notnull --one more column landmark varchar(99) null
  `city` VARCHAR(45) NULL, --notnull
  `state` VARCHAR(45) NULL,--notnull
  `zip` VARCHAR(45) NULL, --notnull
  `country` VARCHAR(45) NULL, --notnull
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
    content VARCHAR(45), -- post_description varchar(100) 
    image_or_video VARCHAR(45), -- image and video should be separate
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
    pet_type VARCHAR(45), --notnull
    pet_name VARCHAR(45), --notnull varchar 99
    pet_breed VARCHAR(45), 
    pet_gender VARCHAR(45),
    pet_profile VARCHAR(45), --pet_profile_image
    pet_weight VARCHAR(45),
    pet_description VARCHAR(199), --one more column pet_dob (date)
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
    clinic_name VARCHAR(45), -- varchar 99 notnull
    start_time VARCHAR(45), -- time_id
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
    user_type VARCHAR(45), --notnull
    address_id INT, --add column user_name varchar99 notnull
    contact_id INT,
    pet_id INT,--null
    post_id INT,--null
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
    user_id INT, --notnull
    contact_id INt, --notnull
    address_id INT, --notnull -- image_id has to be added null
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
    quantity VARCHAR(45), -- order_quantity notnull
    billing_address VARCHAR(99), --this has to be removed
    shipping_address VARCHAR(99), --address_id
    order_status VARCHAR(45), --notnull
    user_id INT,
    item_id INT,
    tracking_id INT, --null
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (item_id) REFERENCES onelove.items(item_id),
    FOREIGN KEY (tracking_id) REFERENCES onelove.tracking(tracking_id)
);


ALTER TABLE onelove.users
ADD COLUMN order_id INT,--null
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
    amount VARCHAR(45), --double with prrescition 2
    payment_type VARCHAR(45),
    date_time VARCHAR(45),--datatype datetime
    payment_status VARCHAR(45), -- address_id has to be added
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
ADD COLUMN payment_id INT, --null
ADD FOREIGN KEY (payment_id) REFERENCES onelove.payments(payment_id);


CREATE TABLE onelove.store (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    discounts VARCHAR(45),--null --add column store_name varchar 99 notnull
    item_id INT,--null
    address_id INT,--notnull
    order_id INT,--null
    payment_id INT,--null
    FOREIGN KEY (item_id) REFERENCES onelove.items(item_id),
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (order_id) REFERENCES onelove.orders(order_id),
    FOREIGN KEY (payment_id) REFERENCES onelove.payments(payment_id)
);

ALTER TABLE onelove.store 
ADD COLUMN store_name VARCHAR(99) NOT NULL AFTER store_id;


CREATE TABLE onelove.inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_status VARCHAR(45), --add column address_id
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
    user_id INT,--notnull
    address_id INT,--notnull
    contact_id INT,--notnull
    service_id INT,--notnull
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

