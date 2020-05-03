<template>
  <div>
    <Topbar />
    <nuxt />
  </div>
</template>

<script>
import Topbar from '../components/Topbar'

export default {
  components: {
    Topbar
  },
  middleware: 'darkmode',
  computed: {
    darkMode() {
      return this.$store.state.configuration.darkMode
    }
  },
  watch: {
    darkMode() {
      document.getElementsByTagName('body')[0].classList.toggle('dark')
    }
  },
  created() {
    this.$store.dispatch('configuration/setStorage', this.$storage)
  }
}
</script>
