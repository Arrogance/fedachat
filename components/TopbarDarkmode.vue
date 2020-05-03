<template>
  <div>
    <b-button
      :variant="darkMode ? 'warning' : 'secondary'"
      @click="toggleDarkMode"
    >
      <b-icon-moon></b-icon-moon>
    </b-button>
  </div>
</template>

<script>
export default {
  computed: {
    darkMode() {
      return this.$store.state.configuration.darkMode
    }
  },
  mounted() {
    if (this.darkMode === true) {
      document.getElementsByTagName('body')[0].classList.toggle('dark')
    }
  },
  methods: {
    toggleDarkMode() {
      this.$store.commit('configuration/toggleDarkMode', !this.darkMode)
      this.$storage.set('darkMode', this.darkMode)
    }
  }
}
</script>
