import { ADMIN_PASSWORD } from '../config';

export default class Admin {
    constructor(socket, users) {
        this.socket = socket;
        this.users = users;
    }

    command(command, content) {
        // eslint-disable-next-line no-eval
        return eval('this.' + command)(content, this);
    }

    admin(content) {
        if (content[0] === ADMIN_PASSWORD) {
            this.socket.isAdmin = true;
        }
    }

    stop(content, _this) {
        let streamUser;

        _this.users.forEach(function(t) {
            if (t.userName === content[0]) {
                streamUser = t;
            }
        });

        if (streamUser) {
            _this.socket.emit('stop_streaming', streamUser);
            _this.socket.emit('message', {
                type: 'chat',
                user: _this.user,
                content: 'Ha cerrado el chat de '+streamUser.userName
            });
        }
    }
}
