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
                    <div v-for="(message) in messages" v-bind:key="message.id" :id="'message-'+message.id">
                        <div v-if="message.type === 'connection'" :class="message.type">
                            <span>
                                <b-icon-forward-fill></b-icon-forward-fill>
                                <strong>{{ message.user.userName }}</strong> se ha conectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'disconnection'" :class="message.type">
                            <span>
                                <b-icon-forward flip-h></b-icon-forward>
                                <strong>{{ message.user.userName }}</strong> se ha desconectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'username_changed'" :class="message.type">
                            <span>
                                <b-icon-people flip-h></b-icon-people>
                                <strong>{{ message.user.userName }}</strong> ahora se llama <strong>{{ message.content }}</strong>.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'chat'" :class="message.type">
                            <strong>{{ message.user.userName }}:</strong>
                            <span v-html="message.content" v-linkified></span>
                        </div>
                        <div v-else-if="message.type === 'start_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video-fill></b-icon-camera-video-fill>
                               <strong>{{ message.user.userName }}</strong> ha comenzado a emitir.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'stop_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video flip-h></b-icon-camera-video>
                                <strong>{{ message.user.userName }}</strong> ha dejado de emitir.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'admin_stop_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video flip-h></b-icon-camera-video>
                                <strong>{{ message.user.userName }}</strong> ha cerrado la retransmisión de {{ message.content }}.
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

    const maxMessagesOnChatBuffer = 250;

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

                if (this.message[0] === '/') {
                    let content = this.message.split(/\s+/),
                        command = content[0].replace('/', '');

                    content.shift();

                    this.$root.socket.emit('message_command', {
                        command: command,
                        content: content
                    });

                    this.message = '';
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
                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'username_changed',
                    content: this.$root.user.userName
                });
            },
            updateChatHeight: function() {
                let fixedHeight = $('.chat-form').outerHeight() + $('#navbar').height() + $('.users-list').outerHeight();
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

                if (this.messages.length > maxMessagesOnChatBuffer) {
                    this.messages.shift();
                }

                if (message.type === 'chat' && message.content[0] === '@') {
                    let nickname = message.content.substring(1);

                    if (this.$root.user.userName === nickname.trim()) {
                        message.content = '<strong>' + message.content + '</strong>';

                        if (this.$root.chatSoundEnabled) {
                            SoundsComponent.playNotificationSound();
                        } else {
                            console.log(message);
                            this.$root.$refs.notifications.sendNotification(
                                'success',
                                {
                                    type: 'chat_mention',
                                    content: message.user.userName
                                }
                            );
                        }
                    }
                } else {
                    if (this.$root.chatSoundEnabled) {
                        SoundsComponent.playBeepSound();
                    }
                }

                let messageDom = $('.chat-messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
                this.updateChatHeight();
            });

            this.$root.$on('username_changed', this.userNameModified);
            this.updateChatHeight();

            let _this = this;
            $(window).resize(function() {
                _this.updateChatHeight();
            });
        }
    }
</script>
