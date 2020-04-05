import { CookieStorage } from './cookie.js';
import { LocalStorage } from './local_storage.js';

class Storage {
    constructor() {
        this.provider = Modernizr.localstorage ? LocalStorage : CookieStorage;
    }

    get(key, defaultValue = null) {
        return this.provider.get(key) ? this.provider.get(key) : defaultValue;
    }

    set(key, value) {
        return this.provider.set(key, value);
    }
}

export default new Storage();
