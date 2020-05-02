export const state = () => ({
  connected: false,
  socket: {}
})

export const mutations = {
  toggleConnected(state, status) {
    state.connected = status
  },
  setSocket(state, status) {
    state.socket = status
  }
}

export const actions = {
  connect({ commit }) {
    commit('toggleConnected', true)
  },
  disconnect({ commit }) {
    commit('toggleConnected', false)
  },
  socket({ commit }, socket) {
    commit('setSocket', socket)
  }
}
