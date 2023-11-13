const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const sever = http.createServer(app);


sever.listen(port);