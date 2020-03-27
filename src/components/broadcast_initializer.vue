<template>
    <section id="app-broadcast-initializer">
        <b-button v-if="true === broadcasting && false === selfMuted" variant="outline-warning" v-on:click="enableSelfMute"><b-icon-mic-fill></b-icon-mic-fill></b-button>
        <b-button v-else-if="true === broadcasting && true === selfMuted" variant="warning" v-on:click="disableSelfMute"><b-icon-mic-mute-fill></b-icon-mic-mute-fill></b-button>

        <b-button v-if="false === broadcasting" variant="success" v-on:click="openModal"><b-icon-camera-video-fill></b-icon-camera-video-fill> Empezar a emitir</b-button>
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
            openModal() {
                this.videoDevices = [];
                this.audioDevices = [];

                let _this = this;
                if (navigator.mediaDevices !== undefined) {
                    navigator.mediaDevices
                        .enumerateDevices({ audio: true, video: true })
                        .then(function(mediaStream) {
                            console.log(mediaStream);
                            _this.$root.mediaEnabled = true;
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

                            _this.$refs['broadcast-initializer-modal'].show('#toggle-btn');
                        })
                        .catch(function(err) {
                            console.log(err);
                        })
                    ;
                }
            },
            closeModal() {
                    this.$refs['broadcast-initializer-modal'].hide('#toggle-btn');
            },
            setVideoDevice(device) {
                console.log(device);
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
                    content: this.$root.user.userName +' ha comenzado a emitir.'
                });

                this.closeModal();
            },
            stopBroadcasting() {
                this.$root.$emit('stop_broadcasting');
                this.selfMuted = false;

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'stop_broadcasting',
                    content: this.$root.user.userName +' ha dejado de emitir.'
                });
            },
            enableSelfMute() {
                this.selfMuted = true;

                this.$root.$emit('self_muted');
            },
            disableSelfMute() {
                this.selfMuted = false;

                this.$root.$emit('self_muted');
            }
        },
        data() {
            return {
                videoDevices: [],
                audioDevices: [],
                broadcasting: false,
                selfMuted: false
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
