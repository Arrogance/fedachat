export const LocalStorage = {
  name: 'LocalStorage',

  get(key) {
    return JSON.parse(localStorage.getItem(key))
  },

  set(key, value) {
    localStorage.setItem(key, value)
  }
}
