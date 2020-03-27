<template>
    <section id="index">
        <b-container fluid="">
            <b-row>
                <b-col cols="8" class="left-column">
                    <app-videos channel="fedachat"></app-videos>
                </b-col>

                <b-col cols="4" class="right-column">
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
