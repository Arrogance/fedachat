export default ({ app }, inject) => {
  let socket = null

  const connect = function(self) {
    if (socket !== null) {
      return socket
    }

    socket = self.$nuxtSocket({
      reconnection: true
    })

    socket.emit('user_connected', self.$store.state.user)

    socket.on('connect', function() {
      self.$store.dispatch('connection/connect')
    })

    socket.on('disconnect', function() {
      self.$store.dispatch('connection/disconnect')
    })

    socket.on('users', function(users) {
      self.$store.commit('users/set', users)
    })

    socket.on('user_information', function(user) {
      self.$store.commit('user/update', user)
    })

    return socket
  }

  inject('socket', connect)
}
