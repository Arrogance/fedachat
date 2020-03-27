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

    socket.on('message', function(event) {
        let message = new MessageModel(event.type, event.content);

        if (event.user) {
            users.forEach(function(value) {
                console.log(value.uuid, event.user.uuid);
                if (value.uuid === event.user.uuid) {
                    console.log('User found', value);
                    message.setUser(value);
                }
            });
        }

        messages.push(message);
        io.emit('message', message);

        console.log('New message', event);
    });

    socket.on('user_connected', function(event) {
        let user = new UserModel(uuidv4(), event.userName);
        user.addSocket(socket.id);

        users.push(user);
        io.emit('users', users);
        socket.emit('user_details', user);
    });

    socket.on('user_disconnected', function(event) {
        users = users.filter(function(value) {
            if (value.socket === socket.id) {
                io.emit('user_disconnected', value);
            }

            return value.userName !== event;
        });

        io.emit('users', users);
    });

    socket.on('user_modified', function(event) {
        users = users.map(function(value) {
            if (value.uuid === event.uuid) {
                console.log('User is the same', event.userName);
                value.userName = event.userName;
            }

            return value;
        });

        io.emit('users', users);
    });

    socket.on('disconnect', function() {
        users = users.filter(function(value) {
            if (value.socket === socket.id) {
                io.emit('user_disconnected', value);
            }

            return value.socket !== socket.id;
        });

        io.emit('users', users);
        console.log('Closed Connection', socket.id);
    });
});

http.listen(9000, () => console.log('Starting service on port 9000'));
