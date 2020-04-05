import { Cookies } from 'js-cookie';

export let CookieStorage = {
    constructor(cookie) {
        this.cookie = cookie;
    },
    get: function() {
        return Cookies.get(this.cookie);
    },

    set: function(key, enabled) {
        this.cookie = key;
        Cookies.set(key, enabled);
    }
};
