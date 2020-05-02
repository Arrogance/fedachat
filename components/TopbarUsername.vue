<template>
  <div>
    <b-button v-if="getUserName" @click="toggleModal('username-modal')">
      <span class="hide-375">{{ getUserName }}</span>
      <span class="hidden show-375"
        ><b-icon-people-circle></b-icon-people-circle
      ></span>
    </b-button>
    <b-button v-else @click="toggleModal('username-modal')">
      <span class="hide-375">Elegir un nick...</span>
      <span class="hidden show-375"
        ><b-icon-people-circle></b-icon-people-circle
      ></span>
    </b-button>

    <b-modal
      ref="username-modal"
      centered
      title="Elige un nombre de usuario"
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
    >
      <b-form id="username-form" @submit.prevent="" @submit="onUsernameSubmit">
        <b-form-group id="username-group">
          <b-form>
            <b-form-input
              id="username"
              v-model="userName"
              :state="userNameValidation.message === null"
              type="text"
              required
              max="22"
              @keydown.enter.prevent="onUsernameSubmit"
            ></b-form-input>
            <b-form-invalid-feedback
              v-text="userNameValidation.message"
            ></b-form-invalid-feedback>
          </b-form>
        </b-form-group>
      </b-form>

      <template v-slot:modal-footer>
        <div class="text-center">
          <b-button type="submit" variant="primary" @click="onUsernameSubmit"
            >Aceptar</b-button
          >
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userName: null,
      userNameValidation: {
        message: null
      }
    }
  },
  computed: {
    getUserName() {
      return this.$store.state.user.userName
    }
  },
  watch: {
    userName(value) {
      if (value === null || value.length === 0) {
        this.setUserNameValidation(
          'Es obligatorio indicar un nombre de usuario.'
        )
      } else {
        this.userName = this.userName.replace(/ /g, '_')
        this.setUserNameValidation()
      }
    }
  },
  methods: {
    onUsernameSubmit() {
      if (this.userName === null || this.userName.length === 0) {
        this.setUserNameValidation(
          'Es obligatorio indicar un nombre de usuario.'
        )
        return
      }

      let alreadyExists = false
      const user = this.$store.state.user
      const _this = this

      this.$store.state.users.list.forEach(function(value) {
        if (
          value.userName === _this.userName &&
          value.userName !== user.userName
        ) {
          alreadyExists = true
        }
      })

      if (alreadyExists === true) {
        _this.setUserNameValidation('El nombre elegido ya está en uso.')
        return
      }

      const oldUserName = user.userName
      if (oldUserName === this.userName) {
        this.toggleModal('username-modal')
        return
      }

      this.$store.dispatch('user/changeUsername', this.userName)
      this.toggleModal('username-modal')

      const socket = this.$socket(this)
      socket.emit('user_username_changed', {
        user,
        oldUsername: oldUserName
      })

      this.setUserNameValidation()
    },
    setUserNameValidation(message) {
      this.userNameValidation = {
        message: message || null
      }
    },
    toggleModal(ref) {
      this.$refs[ref].toggle('#toggle-btn')
    }
  }
}
</script>
