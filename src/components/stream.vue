<template>
    <div :ref="'video-'+streamId" :id="'video-'+streamId" class="video-stream col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <span class="video-stream-username rounded">{{ streamUser }}</span>
        <span v-if="stream.video === false" class="video-stream-audio-only"><b-icon-mic-fill></b-icon-mic-fill></span>
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
                stream: this.streamSource,
                streamId: this.streamSource.getId(),
                streamUser: ''
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

            console.log(this.stream);

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
