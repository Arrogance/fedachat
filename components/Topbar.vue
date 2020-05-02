<template>
  <section id="navbar">
    <b-navbar toggleable="lg" type="dark" variant="dark" fixed="top">
      <b-container fluid="">
        <b-navbar-brand href="#" class="hide-375">
          <h1>FedaChat</h1>
        </b-navbar-brand>

        <b-navbar-nav v-if="isConnected" class="ml-auto">
          <b-nav-item>
            <!--            <app-broadcast-initializer></app-broadcast-initializer>-->
          </b-nav-item>
          <b-nav-item>
            <TopbarUsername />
          </b-nav-item>
          <!--          <b-nav-item>-->
          <!--            <b-button @click="toggleModal('options-modal')"> <b-icon-gear></b-icon-gear> <span class="sr-only">Opciones</span></b-button>-->
          <!--          </b-nav-item>-->
          <!--          <b-nav-item>-->
          <!--            <b-button @click="toggleDarkMode" :variant="darkMode ? 'warning' : 'secondary'">-->
          <!--              <b-icon-moon></b-icon-moon>-->
          <!--            </b-button>-->
          <!--          </b-nav-item>-->
          <!--          <b-nav-item class="header-chat-button hidden show-425" v-on:click="toggleChat">-->
          <!--            <b-button :variant="chatShown ? 'info' : 'secondary'">-->
          <!--              <b-icon-chat-square-dots v-if="!chatShown"></b-icon-chat-square-dots>-->
          <!--              <b-icon-chat-square-dots-fill v-else></b-icon-chat-square-dots-fill>-->
          <!--            </b-button>-->
          <!--          </b-nav-item>-->
        </b-navbar-nav>
      </b-container>
    </b-navbar>
  </section>
</template>

<script>
import TopbarUsername from './TopbarUsername'

export default {
  components: {
    TopbarUsername
  },
  computed: {
    isConnected() {
      return this.$store.state.connection.connected
    }
  }
}
</script>
