// const http = require('http');
// const app = require('./app')
// // Create an instance of the http server to handle HTTP requests
// const port =process.env.PORT || 8080;


// const server = http.createServer(app);
// // Start the server on port 8000
// server.listen(port);
// console.log('Node server running on port '+port);


const http = require('http');
const app = require('./app');

// Create an instance of the http server to handle HTTP requests
const port = process.env.PORT || 8080;

const server = http.createServer(app);

// Start the server on the specified port and IP address
server.listen(port, '192.168.0.117', () => {
  console.log(`Node server running at http://192.168.0.117:${port}`);
});
