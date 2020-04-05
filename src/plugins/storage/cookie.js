import { Cookies } from 'js-cookie';

export let CookieStorage = {
    get: function(key) {
        return Cookies.get(key);
    },

    set: function(key, value) {
        Cookies.set(key, value);
    }
};
