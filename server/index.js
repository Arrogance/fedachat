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
    socket.emit('users', users);

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
    });

    socket.on('user_connected', function(event) {
        let user = new UserModel(uuidv4(), event.userName);
        user.addSocket(socket.id);

        users.push(user);

        let message = {
            user: user,
            type: 'connection'
        };

        io.emit('message', message);
        io.emit('users', users);

        socket.emit('user_details', user);
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
                let message = {
                    user: value,
                    type: 'disconnection'
                };

                io.emit('message', message);
                io.emit('user_disconnected', value);
            }

            return value.socket !== socket.id;
        });

        io.emit('users', users);
    });
});

http.listen(9000, () => console.log('Starting service on port 9000'));
