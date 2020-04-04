<template>
    <section id="navbar">
        <b-navbar toggleable="lg" type="dark" variant="dark" fixed="top">
            <b-container fluid="">
                <b-navbar-brand href="#" class="hide-375">
                    <h1>FedaChat</h1>
                </b-navbar-brand>

                <b-navbar-nav class="ml-auto">
                    <b-nav-item>
                        <app-broadcast-initializer></app-broadcast-initializer>
                    </b-nav-item>
                    <b-nav-item>
                        <b-button v-if="this.$root.user" @click="toggleModal('username-modal')">
                            <span class="hide-375">{{ this.$root.user.userName }}</span>
                            <span class="hidden show-375"><b-icon-people-circle></b-icon-people-circle></span>
                        </b-button>
                        <b-button v-else @click="toggleModal('username-modal')">
                            <span class="hide-375">Elegir un nick...</span>
                            <span class="hidden show-375"><b-icon-people-circle></b-icon-people-circle></span>
                        </b-button>
                    </b-nav-item>
                    <b-nav-item>
                        <b-button @click="toggleModal('options-modal')"> <b-icon-gear></b-icon-gear> <span class="sr-only">Opciones</span></b-button>
                    </b-nav-item>
                    <b-nav-item>
                        <b-button @click="toggleDarkMode" :variant="darkMode ? 'warning' : 'secondary'">
                            <b-icon-moon></b-icon-moon>
                        </b-button>
                    </b-nav-item>
                    <b-nav-item class="hidden show-425" v-on:click="toggleChat">
                        <b-button :variant="chatShown ? 'info' : 'secondary'">
                            <b-icon-chat-square-dots v-if="!chatShown"></b-icon-chat-square-dots>
                            <b-icon-chat-square-dots-fill v-else></b-icon-chat-square-dots-fill>
                        </b-button>
                    </b-nav-item>
                </b-navbar-nav>
            </b-container>
        </b-navbar>

        <div>
            <b-modal ref="username-modal" centered title="Elige un nombre de usuario" no-close-on-esc no-close-on-backdrop hide-header-close :visible="this.$root.forceNewUserNameOnJoin">
                <b-form id="username-form" v-on:submit.prevent="">
                    <b-form-group id="username-group">
                        <b-form >
                            <b-form-input id="username" :state="userNameValidation.message === null" v-model="userName" v-on:keydown.enter.prevent='onUsernameSubmit' type="text" required max="22"></b-form-input>
                            <b-form-invalid-feedback v-text="userNameValidation.message"></b-form-invalid-feedback>
                        </b-form>
                    </b-form-group>
                </b-form>

                <template v-slot:modal-footer>
                    <div class="text-center">
                        <b-button type="submit" variant="primary" v-on:click="onUsernameSubmit">Aceptar</b-button>
                    </div>
                </template>
            </b-modal>

            <b-modal ref="options-modal" centered hide-footer title="Opciones">
                <b-form id="options-form" v-on:submit.prevent="">
                    <b-form-group>
                        <b-form-checkbox v-model="chatSoundEnabled" v-on:input="onChatSoundEnabled" :checked="true" :unchecked-value="false">Sonidos del chat activados</b-form-checkbox>
                    </b-form-group>

                    <b-button type="submit" variant="primary" v-on:click="toggleModal('options-modal')">Aceptar</b-button>
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
                userName: null,
                userNameValidation: {
                    message: null
                },
                chatSoundEnabled: true,
                chatShown: false,
                darkMode: false
            }
        },
        components: {
            'app-broadcast-initializer': BroadcastInitializerComponent
        },
        methods: {
            onUsernameSubmit: function() {
                if (this.userName === null || this.userName.length === 0) {
                    this.setUserNameValidation('Es obligatorio indicar un nombre de usuario.');
                    return;
                }

                let alreadyExists = false;
                let _this = this;
                this.$root.users.forEach(function(user) {
                    if (user.userName === _this.userName && user.userName !== _this.userName) {
                        alreadyExists = true;
                    }
                });

                if (alreadyExists === true) {
                    _this.setUserNameValidation('El nombre elegido ya está en uso.');
                    return;
                }

                let oldUsername = this.$root.user.userName;
                if (oldUsername === this.userName) {
                    this.toggleModal('username-modal');
                    return;
                }

                this.$root.user.userName = this.userName;
                this.toggleModal('username-modal');

                this.$root.$emit('username_changed', {
                    oldUsername: oldUsername
                });

                this.setUserNameValidation();
            },
            setUserNameValidation(message) {
                this.userNameValidation = {
                    message: message ? message : null
                };
            },
            onChatSoundEnabled: function() {
                this.$root.chatSoundEnabled = this.chatSoundEnabled;
            },
            toggleModal(ref) {
                this.$refs[ref].toggle('#toggle-btn')
            },
            toggleChat(event) {
                this.$root.$emit('toggle_chat');
                this.chatShown = !this.chatShown;
            },
            toggleDarkMode() {
                this.$root.$refs.app.classList.toggle('dark');
                this.darkMode = !this.darkMode;
            }
        },
        watch: {
            userName: function(value) {
                if (value === null || value.length === 0) {
                    this.setUserNameValidation('Es obligatorio indicar un nombre de usuario.');
                } else {
                    this.userName = this.userName.replace(/ /g, '_');
                    this.setUserNameValidation();
                }
            }
        },
        mounted() {
            this.chatSoundEnabled = this.$root.chatSoundEnabled;
        }
    }
</script>
