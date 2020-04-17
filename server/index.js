import express from 'express';
import path from 'path';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

import Admin from './admin';
import Notification from './notification';
import AgoraToken from './agora_token';

import UserModel from './models/user';
import MessageModel from './models/message';
import { v4 as uuidv4 } from 'uuid';

app.use('/', express.static(path.resolve(__dirname, '../public')));
app.get('/', (req, res) => res.sendfile(path.resolve(__dirname, '../public/index.html')));

let users = [];
let messages = [];

io.on('connection', socket => {
    let admin = new Admin(socket, io, users);
    let user;

    const token = new AgoraToken();

    socket.emit('users', users);

    socket.on('message_command', function(event) {
        admin.command(event.command, event.content);
    });

    socket.on('message', function(event) {
        let message = new MessageModel(messages.length, event.type, event.content);

        if (event.user) {
            users.forEach(function(value) {
                if (value.uuid === event.user.uuid) {
                    message.setUser(value);
                }
            });
        }

        messages.push(message);
        io.emit('message', message);
    });

    socket.on('user_connected', function(event) {
        user = new UserModel(uuidv4(), event.userName);
        user.addSocket(socket.id);
        user.addStreamToken(token.generateToken(user.uuid));
        user.addStreamId(event.streamId);

        users.push(user);
        admin.user = user;

        let message = new MessageModel(messages.length, 'connection');
        message.setUser(user);

        messages.push(message);
        io.emit('message', message);

        io.emit('users', users);
        admin.users = users;

        socket.emit('user_details', user);
    });

    socket.on('user_modified', function(event) {
        users = users.map(function(value) {
            if (value.uuid === event.uuid) {
                value.userName = event.userName;
                value.streamId = event.streamId;
            }

            return value;
        });

        admin.users = users;

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

        admin.users = users;

        io.emit('users', users);
    });
});

http.listen(9000, () => console.log('Starting service on port 9000'));
