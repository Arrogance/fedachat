<template>
    <div :ref="'video-'+streamId" :id="'video-'+streamId" class="video-stream col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <span class="video-stream-username rounded">{{ streamUser }}</span>
        <span v-if="stream.video === false" class="video-stream-audio-only"><b-icon-mic-fill></b-icon-mic-fill></span>
        <span v-if="stream.audio === true" class="video-stream-pause-video" v-on:click="audioToggle">
            <b-icon-volume-mute-fill v-if="audioMuted === true"></b-icon-volume-mute-fill>
            <b-icon-volume-up-fill v-else></b-icon-volume-up-fill>
        </span>
        <span v-if="stream.video === true" class="video-stream-pause-audio" v-on:click="videoToggle">
            <b-icon icon="camera-video-fill" v-if="videoPaused === false"></b-icon>
            <b-iconstack v-else>
                <b-icon stacked icon="camera-video" scale="1"></b-icon>
                <b-icon stacked icon="slash" scale="2"></b-icon>
            </b-iconstack>
        </span>
        <span v-if="stream.video === true" class="video-stream-fullscreen-video" v-on:click="fullscreenToggle">
            <b-icon icon="fullscreen"></b-icon>
        </span>
    </div>
</template>

<script>
    export default {
        props: {
            streamSource: Object
        },
        data() {
            return {
                elementId: null,
                videoPaused: false,
                audioMuted: false,
                stream: this.streamSource,
                streamId: this.streamSource.getId(),
                streamUser: ''
            }
        },
        methods: {
            videoToggle: function() {
                if (this.videoPaused === true) {
                    this.videoPaused = !this.stream.unmuteVideo();
                } else {
                    this.videoPaused = this.stream.muteVideo();
                }
            },
            audioToggle: function() {
                if (this.audioMuted === true) {
                    this.audioMuted = !this.stream.unmuteAudio();
                } else {
                    this.audioMuted = this.stream.muteAudio();
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
            this.stream.play( this.elementId);

            let _this = this;
            let updateStreamName = (user) => {
                if (user.streamId === _this.streamId) {
                    _this.streamUser = user.userName;
                }
            };

            this.$root.users.forEach(updateStreamName);
            this.$root.$on('users', function() {
                _this.$root.users.forEach(updateStreamName);
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
        }
    }
</script>
