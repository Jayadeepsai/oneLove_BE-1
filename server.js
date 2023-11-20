const http = require('http');
const app = require('./app')
const messageModule = require('./src/messages/message');
// Create an instance of the http server to handle HTTP requests
const port =process.env.PORT || 8080;
const server = http.createServer(app);



server.on('listening', () => {
    messageModule.io.attach(server);
  });
// Start the server on port 8000
server.listen(port);
console.log('Node server running on port '+port);



