import { v4 as uuidv4 } from 'uuid'

export default function(socket, io) {
  if (io.users === undefined) {
    io.users = []
  }

  return Object.freeze({
    connect() {
      socket.emit('users', io.users)
    },
    disconnect() {
      io.users = io.users.filter(function(value) {
        return value.socketId !== socket.id
      })

      io.emit('users', io.users)
    },
    user_connected(user) {
      user.uuid = uuidv4()
      user.socketId = socket.id

      io.users.push(user)

      socket.emit('user_information', {
        uuid: user.uuid,
        socketId: socket.id
      })

      io.emit('users', io.users)
    },
    user_username_changed(data) {
      io.users = io.users.map(function(value) {
        if (value.uuid === data.user.uuid) {
          value.userName = data.user.userName
        }

        return value
      })

      io.emit('users', io.users)
    }
  })
}
