import express from 'express';
import path from 'path';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', express.static(path.resolve(__dirname, '../public')));
app.get('/', (req, res) => res.sendfile(path.resolve(__dirname, '../public/index.html')));

io.on('connection', socket => {
    socket.on('message', msg => io.emit('message', msg));
    socket.on('user_connected', msg => io.emit('user_connected', msg));
});

http.listen(9000, () => console.log('Starting service on port 9000'));
