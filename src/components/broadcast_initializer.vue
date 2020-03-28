<template>
    <section id="app-broadcast-initializer">
        <b-button v-if="true === broadcasting && false === selfMuted" variant="outline-warning" v-on:click="enableSelfMute"><b-icon-mic-fill></b-icon-mic-fill></b-button>
        <b-button v-else-if="true === broadcasting && true === selfMuted" variant="warning" v-on:click="disableSelfMute"><b-icon-mic-mute-fill></b-icon-mic-mute-fill></b-button>

        <b-button v-if="false === broadcasting" variant="success" v-on:click="openModal">
            <b-icon v-if="openingModal" icon="arrow-clockwise" animation="spin"></b-icon>
            <b-icon-camera-video-fill v-else></b-icon-camera-video-fill> Empezar a emitir
        </b-button>
        <b-button v-else variant="danger" v-on:click="stopBroadcasting">Detener emisión</b-button>

        <b-modal id="app-broadcast-initializer-modal" ref="broadcast-initializer-modal" title="Empezar a emitir...">
            <section id="media-list-camera">
                <h5>Selecciona tu cámara</h5>
                <div class="media-list" v-for="(device) in videoDevices" v-bind:key="device.deviceId">
                    <b-button size="lg" :variant="device.deviceId === selectedVideoDevice ? 'primary' : 'outline-primary'" v-b-tooltip.top="device.label" v-on:click="setVideoDevice(device)">
                        <b-icon icon="camera-video-fill" aria-hidden="true"></b-icon>
                        <span>{{ device.label }}</span>
                    </b-button>
                </div>
            </section>

            <section id="media-list-audio">
                <h5>Selecciona tu audio</h5>
                <div class="media-list" v-for="device in audioDevices" v-bind:key="device.deviceId">
                    <b-button size="lg" :variant="device.deviceId === selectedAudioDevice ? 'primary' : 'outline-primary'" v-b-tooltip.top="device.label" v-on:click="setAudioDevice(device)">
                        <b-icon icon="mic" aria-hidden="true"></b-icon>
                        <span>{{ device.label }}</span>
                    </b-button>
                </div>
            </section>

            <template v-slot:modal-footer>
                <div class="text-center">
                    <b-button variant="success" v-on:click="startBroadcasting">¡Comenzar a emitir!</b-button>
                </div>
            </template>
        </b-modal>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                videoDevices: [],
                audioDevices: [],
                selectedVideoDevice: null,
                selectedAudioDevice: null,
                broadcasting: false,
                openingModal: false,
                selfMuted: false
            }
        },
        methods: {
            openModal() {
                this.videoDevices = [];
                this.audioDevices = [];

                this.openingModal = true;

                let _this = this;
                if (navigator.mediaDevices !== undefined) {
                    navigator.mediaDevices
                        .enumerateDevices()
                        .then(() => {
                            _this.$root.mediaEnabled = true;

                            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                            .then(stream => {})
                            .catch(err => {})
                            .finally(function() {
                                navigator.mediaDevices
                                    .enumerateDevices()
                                    .then((mediaStream) => {
                                        mediaStream.forEach(function(device) {
                                            switch(device.kind) {
                                                case 'audioinput':
                                                    _this.audioDevices.push(device);
                                                    break;

                                                case 'videoinput':
                                                    _this.videoDevices.push(device);
                                                    break;
                                            }
                                        });

                                        _this.setAudioDevice(_this.audioDevices[0]);
                                        _this.setVideoDevice(_this.videoDevices[0]);

                                        _this.$refs['broadcast-initializer-modal'].show('#toggle-btn');
                                        _this.openingModal = false;
                                    })
                                ;
                            });
                        })
                        .catch(function (err) {
                            console.log("Something went wrong!", err);
                        })
                    ;
                }
            },
            closeModal() {
                this.$refs['broadcast-initializer-modal'].hide('#toggle-btn');
            },
            setVideoDevice(device) {
                this.selectedVideoDevice = device.deviceId;
                this.$root.$emit('camera_selected', device);
            },
            setAudioDevice(device) {
                this.selectedAudioDevice = device.deviceId;
                this.$root.$emit('audio_selected', device);
            },
            startBroadcasting() {
                this.$root.$emit('start_broadcasting');
                this.broadcasting = true;

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'start_broadcasting'
                });

                this.closeModal();
            },
            stopBroadcasting() {
                this.$root.$emit('stop_broadcasting');
                this.selfMuted = false;

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'stop_broadcasting'
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
        mounted() {
            const _this = this;

            this.$root.$on('stopped_broadcasting', function() {
                _this.broadcasting = false;
            });
        }
    }
</script>
