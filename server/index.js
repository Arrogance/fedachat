import express from 'express';
import path from 'path';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

import UserModel from './models/user';
import MessageModel from './models/message';
import { v4 as uuidv4 } from 'uuid';

app.use('/', express.static(path.resolve(__dirname, '../public')));
app.get('/', (req, res) => res.sendfile(path.resolve(__dirname, '../public/index.html')));

let users = [];
let messages = [];

io.on('connection', socket => {
    console.log('Connected Users', users);

    socket.emit('users', users);
    socket.emit('messages', messages);

    socket.on('message', function(msg) {
        let message = new MessageModel(msg.type, msg.content);

        messages.push(message);
        io.emit('message', message);
    });

    socket.on('user_connected', function(msg) {
        let user = new UserModel(uuidv4(), msg.userName);
        user.addSocket(socket.id);

        users.push(user);
        io.emit('users', users);
        io.emit('user_details', user);
    });

    socket.on('user_disconnected', function(msg) {
        users = users.filter(function(value) {
            return value.userName !== msg;
        });

        io.emit('users', users);
    });

    socket.on('disconnect', function() {
        let user;

        users = users.filter(function(value) {
            if (value.socket === socket.id) {
                user = value;
            }

            return value.socket !== socket.id;
        });

        if (user) {
            io.emit('user_disconnected', user)
        }
    });
});


http.listen(9000, () => console.log('Starting service on port 9000'));
