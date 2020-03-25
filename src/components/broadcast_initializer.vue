<template>
    <section id="app-broadcast-initializer">
        <b-button variant="success" v-on:click="toggleModal"><b-icon-camera-video-fill></b-icon-camera-video-fill> Empezar a emitir</b-button>

        <b-modal ref="broadcast-initializer-modal" hide-footer>
            <b-form id="broadcast-initializer-form" v-on:submit.prevent="">
                <span v-for="device in devices">{{ device }}</span>
            </b-form>
        </b-modal>
    </section>
</template>

<script>
    import AgoraRTC from 'agora-rtc-sdk';

    export default {
        methods: {
            toggleModal() {
                // We pass the ID of the button that we want to return focus to
                // when the modal has hidden
                this.$refs['broadcast-initializer-modal'].toggle('#toggle-btn')
            }
        },
        data() {
            return {
                devices: [],
            }
        },
        mounted() {
            AgoraRTC.getDevices(function(devices) {
                this.devices = devices;
                console.log('Devices', devices);
                console.log('HOLA');
            });

            console.log(this.devices);
        }
    }
</script>
