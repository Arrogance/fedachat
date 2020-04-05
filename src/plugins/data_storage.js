import { Cookies } from 'js-cookie';

export default {
    localStorageEnabled: function() {
        return Modernizr.localstorage;
    },
    get: function(key) {
        if (this.localStorageEnabled()) {
            return JSON.parse(localStorage.getItem(key));
        }

        return Cookies.get(key);
    },
    set: function(key, enabled) {
        if (this.localStorageEnabled()) {
            localStorage.setItem(key, enabled);
        } else {
            Cookies.set(key, enabled);
        }
    }
};
