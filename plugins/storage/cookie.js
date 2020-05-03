import { Cookies } from 'js-cookie'

export const CookieStorage = {
  name: 'CookieStorage',

  get(key) {
    return Cookies.get(key)
  },

  set(key, value) {
    Cookies.set(key, value)
  }
}
