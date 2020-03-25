<template>
    <section id="index">
        <b-container fluid="">
            <b-row>
                <b-col cols="7">
                    <app-videos camera-id="default" microphone-id="default" attendee-mode="video"></app-videos>
                </b-col>

                <b-col cols="5">
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
    }
</script>
