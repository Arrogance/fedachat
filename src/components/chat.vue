<template>
    <section id="app-chat">
        <b-container class="p-0">
            <b-row class="pr-2 pl-3">
                <b-col cols="12" class="users-list">
                    <h5>Usuarios conectados:</h5>
                    <b-badge variant="secondary" class="p-1 ml-1 mr-1" v-for="user in this.$root.users" v-bind:key="user.uuid">
                        {{ user.userName }}
                    </b-badge>
                </b-col>
            </b-row>

            <b-row class="mt-2">
                <b-col cols="12" class="chat-messages pr-0 pl-4" :style="'height: '+ chatHeight +'px'">
                    <div v-for="message in messages">
                        <div v-if="message.type === 'connection'" :class="message.type">
                            <span>
                                <b-icon-forward-fill></b-icon-forward-fill>
                                {{ message.user.userName }} se ha conectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'disconnection'" :class="message.type">
                            <span>
                                <b-icon-forward flip-h></b-icon-forward>
                                {{ message.user.userName }} se ha desconectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'username_changed'" :class="message.type">
                            <span>
                                <b-icon-people flip-h></b-icon-people>
                                {{ message.content }}
                            </span>
                        </div>
                        <div v-else-if="message.type === 'chat'" :class="message.type">
                            <span>
                                {{ message.user.userName }}:
                            </span>
                            <span>
                                {{ message.content }}
                            </span>
                        </div>
                        <div v-else-if="message.type === 'start_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video-fill></b-icon-camera-video-fill>
                                {{ message.content }}
                            </span>
                        </div>
                        <div v-else-if="message.type === 'stop_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video flip-h></b-icon-camera-video>
                                {{ message.content }}
                            </span>
                        </div>
                        <div v-else :class="message.type">
                            <span>{{ message.content }}</span>
                        </div>
                    </div>
                </b-col>
            </b-row>

            <div v-if="this.$root.user" class="chat-form">
                <b-form v-on:submit.prevent="sendMessage">
                    <div class="chat-input">
                        <div class="message_input_wrapper">
                            <b-form-input class="message_input" v-model="message" placeholder="Type your message here..." />
                        </div>
                    </div>
                </b-form>
            </div>
        </b-container>
    </section>
</template>

<script>
    import SoundsComponent from '../plugins/sound.js'

    export default {
        data() {
            return {
                users: [],
                message: '',
                messages: [],
                chatHeight: 0
            }
        },
        methods: {
            sendMessage: function() {
                if (this.message === '') {
                    return;
                }

                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'chat',
                    content: this.message
                });

                this.message = '';
            },
            userNameModified: function(event) {
                let message = event.oldUsername +' ahora se llama '+this.$root.user.userName +'.';

                this.$root.socket.emit('message', {
                    type: 'username_changed',
                    content: message
                });
            },
            updateChatHeight: function() {
                let fixedHeight = $('.chat-form').height() + $('#navbar').height() + $('.users-list').height();
                this.chatHeight = $(window).height() - fixedHeight;
            }
        },
        mounted: function() {
            this.users = this.$root.users;

            this.$root.socket.on('messages', (messages) => {
                this.messages = messages;

                let messageDom = $('.chat-messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
                this.updateChatHeight();
            });

            this.$root.socket.on('message', (message) => {
                this.messages.push(message);

                SoundsComponent.playSound();

                let messageDom = $('.chat-messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
                this.updateChatHeight();
            });

            this.$root.$on('username_changed', this.userNameModified);
            this.updateChatHeight();
        }
    }
</script>
