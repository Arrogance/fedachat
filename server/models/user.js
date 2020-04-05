export default class User {
    constructor(uuid, userName) {
        this.uuid = uuid;
        this.userName = userName;
    }

    addSocket(socket) {
        this.socket = socket;
    }

    addStreamId(streamId) {
        this.streamId = streamId;
    }

    addStreamToken(streamToken) {
        this.streamToken = streamToken;
    }
}
