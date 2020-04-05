export default {
    constructor(key) {
        this.provider = Modernizr.localstorage ? new LocalStorage(key) : new CookieStorage(key);
    },
    get: function() {
        return this.provider.get;
    },
    set: function(key, enabled) {
        this.provider.set(key, enabled);
    }
};
