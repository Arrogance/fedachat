<template>
    <section id="index">
        <app-videos camera-id="123"></app-videos>
    </section>
</template>

<script>
    import VideosComponent from '../components/videos.vue'

    export default {
        components: {
            'app-videos': VideosComponent
        }
    }
</script>
