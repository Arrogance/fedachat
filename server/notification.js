export default class Notification {
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;
    }

    warning(content, isIo = true) {
        let handler = isIo === false ? this.socket : this.io;

        handler.emit('notification', {
            type: 'warning',
            content: content
        });
    }

    success(content, isIo = true) {
        let handler = isIo === false ? this.socket : this.io;

        handler.emit('notification', {
            type: 'success',
            content: content
        });
    }

    danger(content, isIo = true) {
        let handler = isIo === false ? this.socket : this.io;

        handler.emit('notification', {
            type: 'danger',
            content: content
        });
    }
}
