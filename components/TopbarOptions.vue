<template>
  <div>
    <b-button @click="toggleModal('options-modal')">
      <b-icon-gear></b-icon-gear>
      <span class="sr-only">Opciones</span></b-button
    >

    <b-modal ref="options-modal" centered hide-footer title="Opciones">
      <b-form id="options-form" @submit.prevent="">
        <b-form-group>
          <b-form-checkbox
            v-model="chatSoundEnabled"
            :checked="true"
            :unchecked-value="false"
            @input="onChatSoundEnabled"
            >Sonidos del chat activados</b-form-checkbox
          >
        </b-form-group>

        <b-form-group>
          <b-form-checkbox
            v-model="chatEmbedVideoEnabled"
            :checked="true"
            :unchecked-value="false"
            @input="onChatEmbedVideoEnabled"
            >Mostrar el reproductor de vídeo en el chat.</b-form-checkbox
          >
        </b-form-group>

        <b-button
          type="submit"
          variant="primary"
          @click="toggleModal('options-modal')"
          >Aceptar</b-button
        >
      </b-form>
    </b-modal>
  </div>
</template>

<script>
export default {
  computed: {
    chatSoundEnabled() {
      return this.$store.state.configuration.chatSoundEnabled
    },
    chatEmbedVideoEnabled() {
      return this.$store.state.configuration.chatEmbedVideoEnabled
    }
  },
  methods: {
    onChatSoundEnabled(event) {
      this.$store.commit('configuration/toggleChatSoundEnabled', event)
      this.$storage.set('chatSoundEnabled', event)
    },
    onChatEmbedVideoEnabled(event) {
      this.$store.commit('configuration/toggleChatEmbedVideoEnabled', event)
      this.$storage.set('chatEmbedVideoEnabled', event)
    },
    toggleModal(ref) {
      this.$refs[ref].toggle('#toggle-btn')
    }
  }
}
</script>
