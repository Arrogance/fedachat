<template>
    <section id="app-broadcast-initializer">
        <b-button v-if="false === broadcasting" variant="success" v-on:click="toggleModal"><b-icon-camera-video-fill></b-icon-camera-video-fill> Empezar a emitir</b-button>
        <b-button v-else variant="danger" v-on:click="stopBroadcasting">Detener emisión</b-button>

        <b-modal id="app-broadcast-initializer-modal" ref="broadcast-initializer-modal" title="Empezar a emitir..." hide-footer>
            <section id="media-list-camera">
                <h5>Selecciona tu cámara</h5>
                <div class="media-list" v-for="device in videoDevices">
                    <b-button size="lg" variant="outline-primary" v-b-tooltip.top="device.label" v-on:click="setVideoDevice(device)">
                        <b-icon icon="camera-video-fill" aria-hidden="true"></b-icon>
                        <span>{{ device.label }}</span>
                    </b-button>
                </div>
            </section>

            <section id="media-list-audio">
                <h5>Selecciona tu audio</h5>
                <div class="media-list" v-for="device in audioDevices">
                    <b-button size="lg" variant="outline-primary" v-b-tooltip.top="device.label" v-on:click="setAudioDevice(device)">
                        <b-icon icon="mic" aria-hidden="true"></b-icon>
                        <span>{{ device.label }}</span>
                    </b-button>
                </div>
            </section>

            <b-button variant="success" v-on:click="startBroadcasting">¡Comenzar a emitir!</b-button>
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
                this.$refs['broadcast-initializer-modal'].toggle('#toggle-btn');

                this.videoDevices = [];
                this.audioDevices = [];

                if (navigator.mediaDevices !== undefined) {
                    navigator.mediaDevices
                        .getUserMedia({ audio: true, video: true })
                        .then(function(mediaStream) {
                            this.$root.mediaEnabled = true;
                        })
                        .catch(function(err) {
                            console.log(err);
                        })
                    ;

                    let _this = this;
                    AgoraRTC.getDevices(function(devices) {
                        if (devices === undefined) {
                            return;
                        }

                        devices.forEach(function(device) {
                            switch(device.kind) {
                                case 'audioinput':
                                    _this.audioDevices.push(device);
                                    break;

                                case 'videoinput':
                                    _this.videoDevices.push(device);
                                    break;
                            }
                        });
                    });
                }
            },
            setVideoDevice(device) {
                this.$root.$emit('camera_selected', device);
            },
            setAudioDevice(device) {
                this.$root.$emit('audio_selected', device);
            },
            startBroadcasting() {
                this.$root.$emit('start_broadcasting');
                this.broadcasting = true;

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'start_broadcasting',
                    content: this.$root.user.userName +' ha comenzado a emitir'
                });

                this.toggleModal();
            },
            stopBroadcasting() {
                this.$root.$emit('stop_broadcasting');

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'stop_broadcasting',
                    content: this.$root.user.userName +' ha parado de emitir'
                });
            }
        },
        data() {
            return {
                videoDevices: [],
                audioDevices: [],
                broadcasting: false
            }
        },
        mounted() {
            const _this = this;

            this.$root.$on('stopped_broadcasting', function() {
                _this.broadcasting = false;
            });
        }
    }
</script>
