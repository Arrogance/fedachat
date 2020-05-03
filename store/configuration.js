export const state = () => ({
  chatSoundEnabled: true,
  chatEmbedVideoEnabled: true,
  darkMode: false
})

export const mutations = {
  toggleDarkMode(state, value) {
    state.darkMode = value ?? !state.darkMode
  },
  toggleChatEmbedVideoEnabled(state, value) {
    state.chatEmbedVideoEnabled = value ?? !state.chatEmbedVideoEnabled
  },
  toggleChatSoundEnabled(state, value) {
    state.chatSoundEnabled = value ?? !state.chatSoundEnabled
  }
}

export const actions = {
  setStorage({ commit }, storage) {
    commit('toggleDarkMode', storage.get('darkMode'))
    commit('toggleChatEmbedVideoEnabled', storage.get('chatEmbedVideoEnabled'))
    commit('toggleChatSoundEnabled', storage.get('chatSoundEnabled'))
  }
}
