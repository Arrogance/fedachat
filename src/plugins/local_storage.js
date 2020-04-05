export let LocalStorage = {
    constructor(key) {
        this.key = key;
    },
    get: function() {
        return JSON.parse(localStorage.getItem(this.key));
    },

    set: function(key, enabled) {
        this.key = key;
        localStorage.setItem(key, enabled);
    }
};
