import { ADMIN_PASSWORD } from '../config';
import Notification from './notification';

export default class Admin {
    constructor(socket, io, users) {
        this.socket = socket;
        this.io = io;
        this.users = users;
        this.isAdmin = false;

        this.notification = new Notification(socket, io);
    }

    command(command, content) {
        if (this[command] !== undefined) {
            return this[command](content, this);
        }

        this.notification.danger('admin_unknown_command', false);
    }

    admin(content, _this) {
        if (content[0] === ADMIN_PASSWORD) {
            _this.isAdmin = true;
            _this.notification.success('admin_success', false);
            return;
        }

        _this.notification.danger('admin_error', false);
    }

    stop(content, _this) {
        if (!_this.isAdmin) {
            return;
        }

        let streamUser;

        _this.users.forEach(function(t) {
            if (t.userName === content[0]) {
                streamUser = t;
            }
        });

        if (streamUser) {
            _this.io.emit('stop_streaming', streamUser);
            _this.io.emit('message', {
                type: 'admin_stop_broadcasting',
                user: _this.user,
                content: streamUser.userName
            });
        }
    }
}
