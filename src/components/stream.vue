<template>
    <div :ref="'video-'+streamId" :id="'video-'+streamId" class="video-stream col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <span class="video-stream-username">{{ streamUser }}</span>
    </div>
</template>

<script>
    export default {
        props: {
            streamSource: Object
        },
        data() {
            return {
                stream: this.streamSource,
                streamId: this.streamSource.getId(),
                streamUser: ''
            }
        },
        mounted() {
            console.log(this.stream.getId());

            this.stream.play('video-'+this.streamId);

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

            this.$refs['video-'+this.streamId].querySelectorAll('div').forEach(e => {
                console.log(e);
                e.classList.add('rounded');
            });
        }
    }
</script>
