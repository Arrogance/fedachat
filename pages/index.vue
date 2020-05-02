<template>
  <section id="index">
    <b-container fluid="">
      <b-row>
        <b-col ref="left-column" md="8" sm="12" class="left-column show">
          <div style="height: 100px;"></div>
          El socket está <span v-if="isConnected === true">conectado</span
          ><span v-else>desconectado</span>.
          <div style="height: 100px;"></div>
          <div v-for="user in users" :key="user.uuid">
            <span
              >{{ user.userName }} ({{ user.uuid }}, {{ user.socketId }})</span
            >
          </div>
        </b-col>

        <b-col ref="right-column" md="4" sm="12" class="right-column"></b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
export default {
  computed: {
    isConnected() {
      return this.$store.state.connection.connected
    },
    users() {
      return this.$store.state.users.list
    }
  },
  created() {
    this.$socket(this)
  }
}
</script>
