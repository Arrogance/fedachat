<template>
    <section id="index">
        <b-container fluid="">
            <b-row>
                <b-col md="8" sm="12" class="left-column">
                    <app-videos channel="fedachat"></app-videos>
                </b-col>

                <b-col md="4" sm="12" class="right-column">
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
