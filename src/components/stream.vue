<template>
    <div :ref="'video-'+streamId" :id="'video-'+streamId" class="video-stream col-xl-4 col-md-6 col-sm-6 col-xs-12">
        <span class="video-stream-username rounded">{{ streamUser }}</span>
        <span v-if="stream.video === false" class="video-stream-audio-only"><b-icon-mic-fill></b-icon-mic-fill></span>
        <span v-if="!ownStream && stream.audio === true" class="video-stream-pause-video" v-on:click="audioToggle">
            <b-icon-volume-mute-fill v-if="audioMuted === true"></b-icon-volume-mute-fill>
            <b-icon-volume-up-fill v-else></b-icon-volume-up-fill>
        </span>
        <span v-if="!ownStream && stream.video === true" class="video-stream-pause-audio" v-on:click="videoToggle">
            <b-icon icon="camera-video-fill" v-if="videoPaused === false"></b-icon>
            <b-iconstack v-else>
                <b-icon stacked icon="camera-video" scale="1"></b-icon>
                <b-icon stacked icon="slash" scale="2"></b-icon>
            </b-iconstack>
        </span>
        <span v-if="!ownStream && stream.video === true" class="video-stream-fullscreen-video" v-on:click="fullscreenToggle">
            <b-icon icon="fullscreen"></b-icon>
        </span>
        <span class="video-stream-audiowave" ref="audioWave">
            <b-icon-soundwave></b-icon-soundwave>
        </span>
    </div>
</template>

<script>
    export default {
        props: {
            streamSource: Object,
            client: Object,
        },
        data() {
            return {
                elementId: null,
                remoteVideoPaused: false,
                videoPaused: false,
                remoteAudioMuted: false,
                audioMuted: false,
                stream: this.streamSource,
                streamId: this.streamSource.getId(),
                ownStream: false,
                streamUser: ''
            }
        },
        methods: {
            videoToggle: function() {
                if (this.remoteVideoPaused && !this.videoPaused) {
                    return;
                }

                if (this.videoPaused === true) {
                    this.stream.unmuteVideo();
                    this.videoPaused = false;
                } else {
                    let mute = this.stream.muteVideo();
                    this.videoPaused = mute === true;
                }
            },
            audioToggle: function() {
                if (this.remoteAudioMuted && !this.audioMuted) {
                    return;
                }

                if (this.audioMuted === true) {
                    this.stream.unmuteAudio();
                    this.audioMuted = false;
                } else {
                    let mute = this.stream.muteAudio();
                    this.audioMuted = mute === true;
                }
            },
            fullscreenToggle: function() {
                let element = this.$refs[this.elementId].querySelector('video');
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) { /* Firefox */
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) { /* IE/Edge */
                    element.msRequestFullscreen();
                }
            }
        },
        mounted() {
            this.elementId = 'video-'+this.streamId;
            this.stream.play(this.elementId);

            this.streamUser = this.$root.user.streamId === this.streamId ? this.$root.user : null;

            let _this = this;
            let updateStreamName = (user) => {
                if (user.streamId === _this.streamId) {
                    _this.streamUser = user.userName;
                }
            };

            this.$root.users.forEach(updateStreamName);
            this.$root.$on('users', function() {
                _this.$root.users.forEach(updateStreamName);
                if (_this.$root.user && _this.$root.user.streamId === _this.streamId) {
                    _this.ownStream = true;
                }
            });

            this.$refs[ this.elementId].querySelectorAll('div').forEach(e => {
                e.classList.add('rounded');
            });

            if (this.stream.video === false) {
                let playerDom = this.$refs[this.elementId].querySelector('div[id^="player_"]');
                if (playerDom) {
                    playerDom.classList.add('audio-only');
                }
            }

            const audioWaveInterval = () => setInterval(function() {
                let audioLevel = _this.stream.getAudioLevel();

                let transformedAudioLevel = audioLevel * 100;
                if (transformedAudioLevel > 1) {
                    if (!_this.$refs.audioWave.classList.contains('enabled')) {
                        _this.$refs.audioWave.classList.add('enabled');
                    }
                } else {
                    _this.$refs.audioWave.classList.remove('enabled');
                }
            }, 1000);

            if (this.$root.audioEnabled === true) {
                audioWaveInterval();
            } else {
                let firstLog = false;
                document.addEventListener('click', function() {
                    if (!firstLog) {
                        firstLog = true;

                        audioWaveInterval();
                    }
                });
            }

            this.client.on('mute-audio', function(stream) {
                if (_this.streamId === stream.uid) {
                    _this.remoteAudioMuted = true;
                }
            });

            this.client.on('unmute-audio', function(stream) {
                if (_this.streamId === stream.uid) {
                    _this.remoteAudioMuted = false;
                }
            });

            this.client.on('mute-video', function(stream) {
                if (_this.streamId === stream.uid) {
                    _this.remoteVideoPaused = true;
                }
            });

            this.client.on('unmute-video', function(stream) {
                if (_this.streamId === stream.uid) {
                    _this.remoteVideoPaused = false;
                }
            });
        }
    }
</script>
