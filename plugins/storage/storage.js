import { CookieStorage } from './cookie.js'
import { LocalStorage } from './local_storage.js'

export default ({ app }, inject) => {
  class Storage {
    constructor() {
      const html = document.getElementsByTagName('html')[0]
      this.provider = html.classList.contains('localstorage')
        ? LocalStorage
        : CookieStorage
    }

    get(key, defaultValue = null) {
      let value = this.provider.get(key)
      if (value === null || value === undefined) {
        value = defaultValue
      }

      return value
    }

    set(key, value) {
      return this.provider.set(key, value)
    }
  }

  const storage = new Storage()

  inject('storage', storage)

  return storage
}
