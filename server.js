const http = require('http');
const app = require('./app')
const messageModule = require('./src/messages/message');
const port =process.env.PORT || 8080;
const server = http.createServer(app);

server.on('listening', () => {
    messageModule.io.attach(server);
  });
server.listen(port);
console.log('Node server running on port '+port);



