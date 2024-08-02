const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const http = require('http');
const { initWebSocketServer } = require('./wsServer');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
initWebSocketServer(server);

// app.use('/', routes);
app.use(routes);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});