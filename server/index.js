import express from 'express';
import path from 'path';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', express.static(path.resolve(__dirname, '../public')));
app.get('/', (req, res) => res.sendfile(path.resolve(__dirname, '../public/index.html')));

let users = [];

io.on('connection', socket => {
    socket.emit('users', users);

    socket.on('message', function(msg) {
        io.emit('message', msg);
    });

    socket.on('user_connected', function(msg) {
        users.push(msg);
        io.emit('users', users);
    });

    socket.on('user_disconnected', function(msg) {
        users = users.filter(function(value) {
            return value !== msg;
        });
        io.emit('users', users);
    });
});

http.listen(9000, () => console.log('Starting service on port 9000'));
