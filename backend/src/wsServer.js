const WebSocket = require('ws');

let wss;

const initWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New client connected');
        ws.on('message', (message) => {
            console.log(`Received message => ${message}`);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};

const broadcastMessage = (data) => {
    if (!wss) {
        throw new Error('WebSocket server is not initialized');
    }
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

module.exports = {
    initWebSocketServer,
    broadcastMessage
};