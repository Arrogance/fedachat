<template>
    <section id="navbar">
        <b-navbar toggleable="lg" type="dark" variant="dark">
            <b-container>
                <b-navbar-brand href="#">
                    <h1>FedaChat</h1>
                </b-navbar-brand>

                <b-navbar-nav class="ml-auto">
                    <b-nav-item>
                        <app-broadcast-initializer></app-broadcast-initializer>
                    </b-nav-item>
                    <b-nav-item>
                        <b-button v-if="this.$root.user" v-text="this.$root.user.userName" @click="toggleModal"></b-button>
                        <b-button v-else @click="toggleModal">Elegir un nick...</b-button>
                    </b-nav-item>
                </b-navbar-nav>
            </b-container>
        </b-navbar>

        <div>
            <b-modal ref="username-modal" hide-footer title="Elige un nick">
                <b-form id="username-form" v-on:submit.prevent="">
                    <b-form-group id="username-group">
                        <b-form >
                            <b-form-input id="username" v-model="userName" v-on:keydown.enter.prevent='onUsernameSubmit' type="text" required max="22"></b-form-input>
                        </b-form>
                    </b-form-group>

                    <b-button type="submit" variant="primary" v-on:click="onUsernameSubmit">Aceptar</b-button>
                </b-form>
            </b-modal>
        </div>
    </section>
</template>

<script>
    import BroadcastInitializerComponent from '../components/broadcast_initializer.vue'

    export default {
        data() {
            return {
                userName: ''
            }
        },
        components: {
            'app-broadcast-initializer': BroadcastInitializerComponent
        },
        methods: {
            onUsernameSubmit: function() {
                if (this.userName.length === 0) {
                    return;
                }

                let oldUsername = this.$root.user.userName;
                this.$root.user.userName = this.userName;
                this.toggleModal();

                this.$root.$emit('username_changed', {
                    oldUsername: oldUsername
                });
            },
            toggleModal() {
                // We pass the ID of the button that we want to return focus to
                // when the modal has hidden
                this.$refs['username-modal'].toggle('#toggle-btn')
            }
        },
        mounted() {
            if (this.$root.user) {
                this.userName = this.$root.user.userName;
            }
        }
    }
</script>
