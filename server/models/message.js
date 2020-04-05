export default class Message {
    constructor(id, type, content) {
        this.id = id;
        this.type = type;
        this.content = content;
    }

    setUser(user) {
        this.user = user;
    }
}
