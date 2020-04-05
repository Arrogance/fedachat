export let LocalStorage = {
    get: function(key) {
        return JSON.parse(localStorage.getItem(key));
    },

    set: function(key, value) {
        localStorage.setItem(key, value);
    }
};
