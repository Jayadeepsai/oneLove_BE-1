const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;
const {
  generateToken,
  verifyToken,
  addToBlacklist,
  isBlacklisted,
  refreshToken,
} = require('../jwtMiddleware');
const moment = require('moment');
const sinon = require('sinon');
const db = require('../dbConnection');


const jwt = require('jsonwebtoken');
require('dotenv').config();

chai.use(chaiHttp);


//REGISTRATION//

 describe('Registration Route', () => {

  describe('POST /onelove/registration/registration-mobile-number', () => {
    it('should return an error if mobile number is not provided', async () => {
      const response = await chai.request(server).post('/onelove/registration/registration-mobile-number');
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Invalid id provided'); 
    });

    it('should return an error if mobile number is not registered', async () => {
      const invalidMobileNumber = '1234567890';
      const response = await chai.request(server).post('/onelove/registration/registration-mobile-number').query({ mobile_number: invalidMobileNumber });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('No data found for the provided id.'); 
    }).timeout(5000);

    it('should update the external_id and return user data, token, and refresh token if mobile number is registered', async () => {
      const validMobileNumber = '8897820507';
      const newExternalId = '989898989898989898';
      const response = await chai.request(server).post('/onelove/registration/registration-mobile-number').query({ mobile_number: validMobileNumber }).send({ new_external_id: newExternalId });
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('registrationData');
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('refreshToken');
      expect(response.body.message).to.equal('Data fetched sucessfully'); 
    });
  });


      it('should successfully register a user', async () => {
  
      const requestBody = {
      
        address: "KP bustand",
        city: "Ongole",
        state: "Andhra Pradesh",
        zip: "532002",
        country: "India",
        landmark: "Near petrol bunk",
        address_type: "Home",
        mobile_number: "9898989898",
        email: "spider@gmail.com",
        user_type: "pet_owner",
        user_name: "Spider",
        image_type: "profile",
        image_url: [
            "https://onelovemysql.s3.amazonaws.com/Dog3.jpeg"
        ]
      };
  
      const response = await chai.request(server)
        .post('/onelove/registration/registration')
        .send(requestBody);
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("Posted successfully");
    }).timeout(5000);


    it('should restrict a user who is already registered', async () => {
  
      const requestBody = {
      
        address: "KP bustand",
        city: "Ongole",
        state: "Andhra Pradesh",
        zip: "532002",
        country: "India",
        landmark: "Near petrol bunk",
        address_type: "Home",
        mobile_number: "8897820507",
        email: "spider@gmail.com",
        user_type: "pet_owner",
        user_name: "Spiser",
        image_type: "profile",
        image_url: [
            "https://onelovemysql.s3.amazonaws.com/Dog3.jpeg"
        ]
      };
  
      const response = await chai.request(server)
        .post('/onelove/registration/registration')
        .send(requestBody);
  
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('User with this mobile number is already registered.');
    });

 });


//POSTS//

 describe('Posts Route', () => {

    it('should return posts data for authorized users', async () => {
      const userType = 'pet_owner';
      const testToken = generateToken(4, userType); 

      const response = await chai.request(server)
        .get('/onelove/posts/posts')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('postsData');
      expect(response.body.postsData).to.be.an('array');
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Posts Data');
    }).timeout(3000);

    it('should return forbidden for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4, userType); 

      const response = await chai.request(server)
        .get('/onelove/posts/posts')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });


    it('should return unauthorized if token has expired', async () => {
      const userType = 'pet_owner';
      const expiredToken = generateToken(4, userType); 

      // Simulate an expired token by setting a past expiration timestamp
      const expirationTimestamp = Math.floor(Date.now() / 1000) - 3600; // One hour ago
      const expiredTokenWithPastExpiration = jwt.sign({ userId: 4, userType }, process.env.SECRET_KEY_JWT, { expiresIn: expirationTimestamp });

      const response = await chai.request(server)
        .get('/onelove/posts/posts')
        .set('Authorization', `Bearer ${expiredTokenWithPastExpiration}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
    });

    it('should successfully create a post for authorized users', async () => {
     
      const userType = 'pet_owner';
      const testToken = generateToken(4, userType);
  
   
      const requestBody = {
      
        image_url: 'https://example.com/image.jpg',
        image_type: 'jpg',
        // video_type: 'mp4',
        // video_url: 'https://example.com/video.mp4',
        post_type: 'text',
        post_description: 'This is a test post.',
        user_id: 4,
        pet_id: 7
      };
  
      const response = await chai.request(server)
        .post('/onelove/posts/post-feed')
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestBody);
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("Posted successfully");
    });

    it('should return forbidden for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4, userType);
  
      const requestBody = {

        image_url: 'https://example.com/image.jpg',
        image_type: 'jpg',
        // video_type: 'mp4',
        // video_url: 'https://example.com/video.mp4',
        post_type: 'text',
        post_description: 'This is a test post.',
        user_id: 4,
        pet_id: 7
      };
  
      const response = await chai.request(server)
        .post('/onelove/posts/post-feed')
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestBody);
  
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });


   
    it('should return paginated posts data for authorized users', async () => {
      const userType = 'pet_owner';
      const testToken = generateToken(4,userType);
  
      const response = await chai.request(server)
        .get('/onelove/posts/postsPagination')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          page: 1,
          perPage: 5,
        });
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('postsData');
      expect(response.body.postsData).to.be.an('array');
      expect(response.body).to.have.property('page');
      expect(response.body).to.have.property('perPage');
      expect(response.body).to.have.property('message');
      expect(response.body.page).to.equal(1);
      expect(response.body.perPage).to.equal(5);
    });
  
    it('should return forbidden for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4, userType);
  
      const response = await chai.request(server)
        .get('/onelove/posts/postsPagination')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          page: 1,
          perPage: 5,
        });
  
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });


    it('should return posts data for authorized users with user_id and pet_id', async () => {
      const userType = 'pet_owner';
      const testToken = generateToken(4, userType);
  
      const response = await chai.request(server)
        .get('/onelove/posts/posts-pet-user')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          user_id:4,
          pet_id: 7,
        });
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('postData');
      expect(response.body.postData).to.be.an('array');
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Data fetched sucessfully');
    });
  
    it('should return no data for authorized users with non-existing user_id and pet_id', async () => {
      const userType = 'pet_owner'; 
      const testToken = generateToken(4, userType);
  
      const response = await chai.request(server)
        .get('/onelove/posts/posts-pet-user')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          user_id:100,
          pet_id:7,
        });
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("No data found for the provided id.");
    });
  
    it('should return forbidden for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4,userType);
  
      const response = await chai.request(server)
        .get('/onelove/posts/posts-pet-user')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          user_id: 4,
          pet_id: 7,
        });
  
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });


    it('should update a post successfully', async () => {
      const userType = 'pet_owner'; 
      const testToken = generateToken(4,userType);
  
      const existingPostId = 69;

      const requestBody = {
        post_description: 'Updated post description',
      };
  
      const response = await chai.request(server)
        .put(`/onelove/posts/update-post?post_id=${existingPostId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestBody);
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('updatedData');
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("Data updated successfully.");
    });

  
    it('should return an error for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4,userType);
  
      const existingPostId = 67;
  
      const requestBody = {
        post_description: 'Updated post description',
      };
  
      const response = await chai.request(server)
        .put(`/onelove/posts/update-post?post_id=${existingPostId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestBody);
  
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });


    it('should delete a post successfully', async () => {
      const userType = 'pet_owner'; 
      const testToken = generateToken(4,userType);

      const existingPostId = 73;
  
      const response = await chai.request(server)
        .delete(`/onelove/posts/delete-post?post_id=${existingPostId}`)
        .set('Authorization', `Bearer ${testToken}`);
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("Data deleted successfully");
    });
  
    it('should return an error for unauthorized users', async () => {
      const userType = 'unauthorized_user';
      const testToken = generateToken(4,userType);
  
      const existingPostId = 71;
  
      const response = await chai.request(server)
        .delete(`/onelove/posts/delete-post?post_id=${existingPostId}`)
        .set('Authorization', `Bearer ${testToken}`);
  
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal('Forbidden');
    });
  
    it('should return an error for an invalid post_id', async () => {
      const userType = 'pet_owner'; 
      const testToken = generateToken(4, userType);

      const invalidPostId = -1;
  
      const response = await chai.request(server)
        .delete(`/onelove/posts/delete-post?post_id=${invalidPostId}`)
        .set('Authorization', `Bearer ${testToken}`);
  
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.equal("Invalid id provided");
    });
  
 });



//PETS//

 describe('Pet Post Route', () => {

  it('should create a pet post successfully', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const requestBody = {
      pet_type: 'dog',
      pet_name: 'Buddy',
      pet_breed: 'Golden Retriever',
      pet_gender: 'male',
      pet_weight: 30,
      pet_description: 'Friendly and energetic',
      pet_dob: '2021-01-15',
      spay_neuter: true,
      image_type: 'jpg',
      image_url: 'https://example.com/dog.jpg',
      user_id: 4
    };

    const response = await chai.request(server)
      .post('/onelove/pets/pet-post')
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Posted successfully");
    expect(response.body).to.have.property('petResult');
  }).timeout(3000);

  it('should return an error for unauthorized users', async () => {
    const userType = 'unauthorized_user';
    const testToken = generateToken(4,userType);

    const requestBody = {
      pet_type: 'cat',
      pet_name: 'Whiskers',
      pet_breed: 'Golden Retriever',
      pet_gender: 'male',
      pet_weight: 30,
      pet_description: 'Friendly and energetic',
      pet_dob: '2021-01-15',
      spay_neuter: true,
      image_type: 'jpg',
      image_url: 'https://example.com/dog.jpg',
      user_id: 4
    };

    const response = await chai.request(server)
      .post('/onelove/pets/pet-post')
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

 it('should fetch pets data for authorized users', async () => {
    const userType = 'pet_owner';
    const testToken = generateToken(4,userType);

    const response = await chai.request(server)
      .get('/onelove/pets/pets')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('petsData');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return forbidden for unauthorized users', async () => {
    const userType = 'unauthorized_user';
    const testToken = generateToken(4,userType);

    const response = await chai.request(server)
      .get('/onelove/pets/pets')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });


  it('should update pet data for authorized pet owners', async () => {
    const userType = 'pet_owner';
    const testToken = generateToken(4, userType);

    const petIdToUpdate =7;

    const requestBody = {
      pet_type: 'Dog',
      pet_name: 'Whisky', 
    };

    const response = await chai.request(server)
      .put(`/onelove/pets/update-pet?pet_id=${petIdToUpdate}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data updated successfully.");
  }).timeout(3000);

  it('should return forbidden for unauthorized users', async () => {
    const userType = 'unauthorized_user';
    const testToken = generateToken(4, userType);

    const response = await chai.request(server)
      .put('/onelove/pets/update-pet?pet_id=8') 
      .set('Authorization', `Bearer ${testToken}`)
      .send({});

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  it('should return pets data for authorized pet owners, doctors, and trainers', async () => {
    const userType = 'pet_owner';
    const testToken = generateToken(4, userType);

    const userIdToQuery = 4;

    const response = await chai.request(server)
      .get(`/onelove/pets/pets-users?user_id=${userIdToQuery}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('pet');
    expect(response.body.pet).to.be.an('array');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return forbidden for unauthorized users', async () => {
    const userType = 'unauthorized_user';
    const testToken = generateToken(4, userType);

    const response = await chai.request(server)
      .get('/onelove/pets/pets-users?user_id=4') 
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  it('should return invalid ID for missing user_id parameter', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const response = await chai.request(server)
      .get('/onelove/pets/pets-users')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Invalid id provided");
  });


  it('should successfully delete a pet for authorized pet owners', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const petIdToDelete = 28;

    const response = await chai.request(server)
      .delete(`/onelove/pets/delete-pet?pet_id=${petIdToDelete}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data deleted successfully");
  });

  it('should return no data for deleting a non-existing pet', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const nonExistingPetId = 9999;

    const response = await chai.request(server)
      .delete(`/onelove/pets/delete-pet?pet_id=${nonExistingPetId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("No data found for the provided id.");
  });

  it('should return forbidden for unauthorized users', async () => {
    const userType = 'unauthorized_user';
    const testToken = generateToken(4, userType);

    const petIdToDelete = 9; 

    const response = await chai.request(server)
      .delete(`/onelove/pets/delete-pet?pet_id=${petIdToDelete}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

 });



//USERS

describe('User Profile Route', () => {

  it('should successfully update user profile for authorized users', async () => {
    const userType = 'pet_owner'; // Adjust the user type as needed
    const testToken = generateToken(4,userType);

    const userIdToUpdate = 4;

    const requestBody = {
      user_name:"Deepu Mettela"
    };

    const response = await chai.request(server)
      .put(`/onelove/users/update-user-profile?user_id=${userIdToUpdate}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data updated successfully.");
  }).timeout(3000)

  it('should return invalid ID for missing user_id in the request', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const userIdToUpdate = -1; 

    const requestBody = {
      user_name:"Dumb"
    };

    const response = await chai.request(server)
      .put(`/onelove/users/update-user-profile`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(400);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Invalid id provided");
  });


  it('should successfully fetch user data by user ID', async () => {
  
    const userIdToFetch = 4;
    const userType = 'pet_owner';
    const testToken = generateToken(4,userType );

    const response = await chai.request(server)
      .get(`/onelove/users/users-id?user_id=${userIdToFetch}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('userData');
    expect(response.body.userData).to.be.an('array');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return no data for non-existing user ID', async () => {
    
    const nonExistingUserId = 999; 
    const userType = 'pet_owner';
    const testToken = generateToken(4, userType);

    const response = await chai.request(server)
      .get(`/onelove/users/users-id?user_id=${nonExistingUserId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("No data found for the provided id.");
  });

 });


//ITEMS

describe('Item routes', () => {
  
       it('should create a item entry successfully', async () => {
    const userType = 'pet_store'; 
    const testToken = generateToken(12, userType);

    const requestBody = {
      image_type: 'product_image', 
      image_url: ["https://onelovebucket.s3.amazonaws.com/rn_image_picker_lib_temp_a5563a6a-b0c5-4b8e-9898-bea56889d29f.jpg"],
  
      brand_name: 'Sample Brand',
      product_title: 'Sample Product', 
      pet_type_product: 'Dog',
      item_description: 'Sample description',
      product_details: 'Sample details', 
      store_id: 4,
      quantity: [{"mrp": "100", "discount": "25", "quantity": "20 kg", "item_count": "10", "quantity_type": "kg"}],
      sub_category_name: 'food_treats',
      collection_name: 'Dry Food'
    };

    const response = await chai.request(server)
      .post('/onelove/items/item-entry')
      .set('Authorization', `Bearer ${testToken}`)
      .send(requestBody);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Posted successfully");
  }).timeout(10000);


  it('should return forbidden for non-pet-store users', async () => {
    const userType = 'pet_owner'; 
    const testToken = generateToken(4, userType);

    const requestBody = {
      image_type: 'product_image', 
      image_url: ["https://onelovebucket.s3.amazonaws.com/rn_image_picker_lib_temp_a5563a6a-b0c5-4b8e-9898-bea56889d29f.jpg"],
  
      brand_name: 'Sample Brand',
      product_title: 'Sample Product', 
      pet_type_product: 'Dog',
      item_description: 'Sample description',
      product_details: 'Sample details', 
      store_id: 4,
      quantity: [{"mrp": "100", "discount": "25", "quantity": "20 kg", "item_count": "10", "quantity_type": "kg"}],
      sub_category_name: 'food_treats',
      collection_name: 'Dry Food'
    };

    const response = await chai.request(server)
        .post('/onelove/items/item-entry')
        .set('Authorization', `Bearer ${testToken}`)
        .send(requestBody);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
});

it('should successfully fetch all products for authorized users', async () => {
  const userType = 'pet_owner'; 
  const testToken = generateToken(4, userType);

  const response = await chai.request(server)
    .get('/onelove/items/products')
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('productsData');
  expect(response.body.productsData).to.be.an('array');
  expect(response.body.message).to.equal('Data fetched sucessfully');
});

it('should successfully fetch a specific product by item ID for authorized users', async () => {
  const userType = 'pet_owner'; 
  const testToken = generateToken(4, userType);

  const itemIdToFetch = 27;
  const response = await chai.request(server)
    .get(`/onelove/items/products-id?item_id=${itemIdToFetch}`)
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('productData');
  expect(response.body.productData).to.be.an('array');
  expect(response.body.message).to.equal('Data fetched sucessfully');
});

it('should return forbidden for unauthorized users when fetching a specific product by item ID', async () => {
  const userType = 'invalid_user'; 
  const testToken = generateToken(4, userType);

  const itemIdToFetch = 27; 
  const response = await chai.request(server)
    .get(`/onelove/items/products-id?item_id=${itemIdToFetch}`)
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(403);
  expect(response.body).to.have.property('message');
  expect(response.body.message).to.equal('Forbidden');
});

 it('should successfully fetch all products for a specific store ID for authorized users', async () => {
  const userType = 'pet_owner'; 
  const testToken = generateToken(4, userType);

  const storeIdToFetch = 4; 
  const response = await chai.request(server)
    .get(`/onelove/items/products-store-id?store_id=${storeIdToFetch}`)
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('productData');
  expect(response.body.productData).to.be.an('array');
  expect(response.body.message).to.equal('Data fetched sucessfully');
});

it('should return forbidden for unauthorized users when fetching all products for a specific store ID', async () => {
  const userType = 'invalid_user'; 
  const testToken = generateToken(4, userType);

  const storeIdToFetch = 4;
  const response = await chai.request(server)
    .get(`/onelove/items/products-store-id?store_id=${storeIdToFetch}`)
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(403);
  expect(response.body).to.have.property('message');
  expect(response.body.message).to.equal('Forbidden');
});

const testingToken = generateToken(4, 'pet_store');

  it('should successfully fetch products based on store_id and item_id', async () => {
    const response = await chai.request(server)
      .get('/onelove/items/product-store-item-id')
      .set('Authorization', `Bearer ${testingToken}`)
      .query({ store_id: 4, item_id: 24 });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('productData');
    expect(response.body.productData).to.be.an('array');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return no data when fetching products with invalid store_id and item_id', async () => {
    const response = await chai.request(server)
      .get('/onelove/items/product-store-item-id')
      .set('Authorization', `Bearer ${testingToken}`)
      .query({ store_id: -1, item_id: -1 });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("No data found for the provided id.");
  });

  it('should successfully update an item for pet_store users', async () => {
    const itemToUpdate = {
      item_id: 27, 
      brand_name: 'New Brand Name',
      product_title: 'New Product Title',
     
    };

    const response = await chai.request(server)
      .put('/onelove/items/update-item')
      .set('Authorization', `Bearer ${testingToken}`)
      .query({ item_id: itemToUpdate.item_id })
      .send(itemToUpdate);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data updated successfully.");
  });

  it('should return forbidden for non-pet_store users when updating an item', async () => {
    const nonPetStoreToken = generateToken(4, 'pet_owner');

    const itemToUpdate = {
      item_id: 1, 
      brand_name: 'New Brand Name',
      product_title: 'New Product Title',
    
    };

    const response = await chai.request(server)
      .put('/onelove/items/update-item')
      .set('Authorization', `Bearer ${nonPetStoreToken}`)
      .query({ item_id: itemToUpdate.item_id })
      .send(itemToUpdate);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  it('should successfully delete items for pet_store users', async () => {
    const itemsToDelete = [26,25]; 

    const response = await chai.request(server)
      .delete('/onelove/items/delete-items')
      .set('Authorization', `Bearer ${testingToken}`)
      .query({ item_id: itemsToDelete });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data deleted successfully");
  });

  it('should return forbidden for non-pet_store users when deleting items', async () => {
    const nonPetStoreToken = generateToken(4, 'pet_owner'); 
    const itemsToDelete = [26,25];

    const response = await chai.request(server)
      .delete('/onelove/items/delete-items')
      .set('Authorization', `Bearer ${nonPetStoreToken}`)
      .query({ item_id: itemsToDelete });

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });



it('should successfully fetch stores data for pet_owner users', async () => {
  const testToken = generateToken(4, 'pet_owner');
  const response = await chai.request(server)
    .get('/onelove/items/stores')
    .set('Authorization', `Bearer ${testToken}`);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('storesData');
  expect(response.body.storesData).to.be.an('array');
  expect(response.body.message).to.equal('Data fetched sucessfully');
});

it('should return forbidden for non-pet_owner users when fetching stores data', async () => {
  const nonPetOwnerToken = generateToken(4, 'pet_store'); 

  const response = await chai.request(server)
    .get('/onelove/items/stores')
    .set('Authorization', `Bearer ${nonPetOwnerToken}`);

  expect(response.status).to.equal(403);
  expect(response.body).to.have.property('message');
  expect(response.body.message).to.equal('Forbidden');
});

});


//SERVICE//

describe('Service Route', () => {

  const testTokenPetOwner = generateToken(4, 'pet_owner');
  const testTokenPetTrainer = generateToken(13, 'pet_trainer');
  const nonAuthorizedToken = generateToken(6, 'non_authorized_user_type');

  it('should fetch all services for authorized pet owners', async () => {
    const response = await chai.request(server)
      .get('/onelove/services/service')
      .set('Authorization', `Bearer ${testTokenPetOwner}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('servicesData');
    expect(response.body.servicesData).to.be.an('array');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return forbidden for unauthorized users', async () => {
    const response = await chai.request(server)
      .get('/onelove/services/service')
      .set('Authorization', `Bearer ${nonAuthorizedToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  it('should fetch services by user ID for authorized pet owners and pet trainers', async () => {
    const userIdToFetch = 13; 

    const responsePetOwner = await chai.request(server)
      .get(`/onelove/services/service-user-id?user_id=${userIdToFetch}`)
      .set('Authorization', `Bearer ${testTokenPetOwner}`);

    expect(responsePetOwner.status).to.equal(200);
    expect(responsePetOwner.body).to.have.property('servicesData');
    expect(responsePetOwner.body.servicesData).to.be.an('array');
    expect(responsePetOwner.body).to.have.property('message');
    expect(responsePetOwner.body.message).to.equal('Data fetched sucessfully');

    // Fetching by pet trainer
    const responsePetTrainer = await chai.request(server)
      .get(`/onelove/services/service-user-id?user_id=${userIdToFetch}`)
      .set('Authorization', `Bearer ${testTokenPetTrainer}`);

    expect(responsePetTrainer.status).to.equal(200);
    expect(responsePetTrainer.body).to.have.property('servicesData');
    expect(responsePetTrainer.body.servicesData).to.be.an('array');
    expect(responsePetTrainer.body).to.have.property('message');
    expect(responsePetTrainer.body.message).to.equal('Data fetched sucessfully');
  });

  it('should return forbidden for unauthorized users when fetching by user ID', async () => {
    const userIdToFetch = 13; 

    const response = await chai.request(server)
      .get(`/onelove/services/service-user-id?user_id=${userIdToFetch}`)
      .set('Authorization', `Bearer ${nonAuthorizedToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

});


//ORDERS//

describe('Orders route', () => {

  const testTokenPetOwner = generateToken(4, 'pet_owner');
  const testTokenPetStore = generateToken(12, 'pet_store');
  const nonAuthorizedToken = generateToken(6, 'non_authorized_user_type');

  it('should create an order entry successfully', async () => {
    const requestBody = {
      store_id: 4,
      user_id: 4,
      orders: [
        {
          "item_id": 28,
          "item_name": "Pedigree",
          "item_quantity": "6",
          "item_price": "800",
          "image_url": [
            "jsdhgvhjbbhbjb",
            "ijabajhfdshjbjhj"
          ]
        }
      ],
      status: "Placed"
    };

    const response = await chai.request(server)
      .post('/onelove/order/order')
      .set('Authorization', `Bearer ${testTokenPetOwner}`)
      .send(requestBody);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Posted successfully");
  }).timeout(10000);

  it('should return forbidden for unauthorized users', async () => {
    const requestBody = {
      store_id: 4,
      user_id: 4,
      orders: [
        {
          "item_id": 28,
          "item_name": "Pedigree",
          "item_quantity": "6",
          "item_price": "800",
          "image_url": [
            "jsdhgvhjbbhbjb",
            "ijabajhfdshjbjhj"
          ]
        }
      ],
      status: "Placed"
    };

    const response = await chai.request(server)
      .post('/onelove/order/order')
      .set('Authorization', `Bearer ${nonAuthorizedToken}`)
      .send(requestBody);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  

  it('should fetch orders by user ID for authorized pet owners', async () => {
    const userIdToFetch = 4; 

    const response = await chai.request(server)
      .get(`/onelove/order/orders?user_id=${userIdToFetch}`)
      .set('Authorization', `Bearer ${testTokenPetOwner}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.be.an('array');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Data fetched sucessfully');
  }).timeout(3000);

  it('should fetch orders by order ID for authorized pet owners and pet stores', async () => {
    const orderIdToFetch = 72; 

    
    const responsePetOwner = await chai.request(server)
      .get(`/onelove/order/orders?order_id=${orderIdToFetch}`)
      .set('Authorization', `Bearer ${testTokenPetOwner}`);

    expect(responsePetOwner.status).to.equal(200);
    expect(responsePetOwner.body).to.have.property('data');
    expect(responsePetOwner.body.data).to.be.an('array');
    expect(responsePetOwner.body).to.have.property('message');
    expect(responsePetOwner.body.message).to.equal('Data fetched sucessfully');

    
    const responsePetStore = await chai.request(server)
      .get(`/onelove/order/orders?order_id=${orderIdToFetch}`)
      .set('Authorization', `Bearer ${testTokenPetStore}`);

    expect(responsePetStore.status).to.equal(200);
    expect(responsePetStore.body).to.have.property('data');
    expect(responsePetStore.body.data).to.be.an('array');
    expect(responsePetStore.body).to.have.property('message');
    expect(responsePetStore.body.message).to.equal('Data fetched sucessfully');
  }).timeout(3000);

  it('should return forbidden for unauthorized users when fetching orders', async () => {
    const response = await chai.request(server)
      .get('/onelove/order/orders')
      .set('Authorization', `Bearer ${nonAuthorizedToken}`);

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

  it('should update order status for authorized pet stores', async () => {
    
    const storeId = 4; 
    const statusToUpdate = {storeId:4,status:'Shipped'}; 

    const response = await chai.request(server)
      .put('/onelove/order/update-status?order_id=69')
      .set('Authorization', `Bearer ${testTokenPetStore}`)
      .send(statusToUpdate);

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal("Data updated successfully.");
  }).timeout(5000);

  it('should return forbidden for unauthorized users when updating order status', async () => {
    const response = await chai.request(server)
      .put('/onelove/order/update-status')
      .set('Authorization', `Bearer ${nonAuthorizedToken}`)
      .send({
        order_id: 69,
        store_id: 4,
        status: 'Shipped'
      });

    expect(response.status).to.equal(403);
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Forbidden');
  });

});


//MESSAGES//

describe('Messages Route',() =>{

  const testTokenPetOwner = generateToken(4, 'pet_owner');
  const testTokenUnAuthorised = generateToken(4, 'Un_authorised');

  it('should get chat messages between two users', async () => {
    const sender_id = 10;
    const receiver_id = 11;

    const response = await chai.request(server)
      .get(`/onelove/message/messages?sender_id=${sender_id}&receiver_id=${receiver_id}`)
      .set('Authorization', `Bearer ${testTokenPetOwner}`)

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('chat');
    expect(response.body.chat).to.be.an('array');
    expect(response.body).to.have.property('message');
    expect(response.body.message).to.equal('Data fetched sucessfully');

    // Validate the message timestamps
    const messages = response.body.chat;
    messages.forEach(message => {
      expect(moment(message.time, 'YYYY-MM-DD HH:mm:ss', true).isValid()).to.be.true;
    });
  });

  it('should handle errors when getting chat messages', async () => {
    // Mock database error
    const stub = sinon.stub(db, 'query').throws(new Error('Database error'));

    const response = await chai.request(server)
      .get('/onelove/message/messages')
      .set('Authorization', `Bearer ${testTokenPetOwner}`)

    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('error');
    expect(response.body.error).to.equal('Failed to fetch data');

    stub.restore(); 
  });

  it('should get chat history for a user', async () => {

    const user_id = 10; 

    const response = await chai.request(server)
    .get(`/onelove/message/chat_history?user_id=${user_id}`)
    .set('Authorization', `Bearer ${testTokenPetOwner}`);

  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('Data');
  expect(response.body.Data).to.be.an('array');
  expect(response.body).to.have.property('message');
  expect(response.body.message).to.equal('Data fetched sucessfully')

  });

});