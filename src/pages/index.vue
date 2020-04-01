<template>
    <section id="index">
        <b-container fluid="">
            <b-row>
                <b-col md="8" sm="12" class="left-column show" ref="left-column">
                    <app-videos channel="fedachat"></app-videos>
                </b-col>

                <b-col md="4" sm="12" class="right-column" ref="right-column">
                    <app-chat></app-chat>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import VideosComponent from '../components/videos.vue'
    import ChatComponent from '../components/chat.vue'

    export default {
        components: {
            'app-videos': VideosComponent,
            'app-chat': ChatComponent
        },
        methods: {
            toggleChat: function() {
                this.$refs['right-column'].classList.toggle('show');
                this.$refs['left-column'].classList.toggle('show');
            }
        },
        mounted() {
            this.$root.$on('toggle_chat', this.toggleChat);
        }
    }
</script>
