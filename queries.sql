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


  CREATE TABLE `onelove`.`service` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `price` VARCHAR(45) NULL,
  `service_name` VARCHAR(45) NULL,
  `start_time` VARCHAR(45) NULL,
  `end_time` VARCHAR(45) NULL,
  PRIMARY KEY (`service_id`));


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


  CREATE TABLE `onelove`.`contact_details` (
  `contact_id` INT NOT NULL AUTO_INCREMENT,
  `mobile_number` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  PRIMARY KEY (`contact_id`));


  CREATE TABLE `onelove`.`address` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(99) NULL,
  `city` VARCHAR(45) NULL,
  `state` VARCHAR(45) NULL,
  `zip` VARCHAR(45) NULL,
  `country` VARCHAR(45) NULL,
  PRIMARY KEY (`address_id`));


  CREATE TABLE onelove.posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    post_type VARCHAR(45),
    content VARCHAR(45),
    image_or_video VARCHAR(45),
    love_index_id INT,
    FOREIGN KEY (love_index_id) REFERENCES onelove.love_index(love_index_id)
);


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


CREATE TABLE onelove.registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    contact_id INt,
    address_id INT,
    FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id)
);


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


CREATE TABLE onelove.payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    amount VARCHAR(45),
    payment_type VARCHAR(45),
    date_time VARCHAR(45),
    payment_status VARCHAR(45),
    order_id INT,
    FOREIGN KEY (order_id) REFERENCES onelove.orders(order_id)
);


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

