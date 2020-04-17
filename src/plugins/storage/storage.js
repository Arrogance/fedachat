import { CookieStorage } from './cookie.js';
import { LocalStorage } from './local_storage.js';

class Storage {
    constructor() {
        this.provider = Modernizr.localstorage ? LocalStorage : CookieStorage;
    }

    get(key, defaultValue = null) {
        let value = this.provider.get(key);
        if (value === null || value === undefined) {
            value = defaultValue;
        }

        return value;
    }

    set(key, value) {
        return this.provider.set(key, value);
    }
}

export default new Storage();
