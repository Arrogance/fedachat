import randomWords from 'random-words'

const userName = randomWords({
  exactly: 3,
  wordsPerString: 1,
  formatter: (word, index) => {
    return index === 0
      ? word
          .slice(0, 1)
          .toUpperCase()
          .concat(word.slice(1))
      : word
  }
})

export const state = () => ({
  uuid: null,
  socketId: null,
  userName: userName.join('_').substring(0, 22),
  streamToken: null,
  streamId: null
})

export const mutations = {
  userName(state, userName) {
    state.userName = userName
  },
  update(state, user) {
    state.uuid = user.uuid
    state.socketId = user.socketId
  }
}

export const actions = {
  changeUsername({ commit }, userName) {
    commit('userName', userName)
  }
}
