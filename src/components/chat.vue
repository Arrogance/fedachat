<template>
    <section id="app-chat">
        <b-container>
            <b-form v-if="this.$root.user" v-on:submit.prevent="sendMessage">
                <b-row>
                    <b-col cols="10" class="p-0">
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

                    <b-col cols="2">
                        <ul>
                            <li v-for="user in this.$root.users">{{ user.userName }}</li>
                        </ul>
                    </b-col>
                </b-row>

                <b-row>
                    <b-col cols="8">
                        <div class="message_input_wrapper">
                            <input class="message_input" v-model="message" placeholder="Type your message here..." />
                        </div>
                    </b-col>

                    <b-col cols="4">
                        <div class="send_message" v-on:click="sendMessage">
                            <div class="icon"></div>
                            <div class="text">Send</div>
                        </div>
                    </b-col>
                </b-row>
            </b-form>
        </b-container>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                users: [],
                message: '',
                messages: []
            }
        },
        methods: {
            sendMessage: function() {
                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'chat',
                    content: this.message
                });

                this.message = '';
            },
            userNameModified: function(event) {
                let message = event.oldUsername +' ahora se llama '+this.$root.userName +'.';

                this.$root.socket.emit('message', {
                    type: 'username_changed',
                    content: message
                });
            }
        },
        mounted: function() {
            this.userName = this.$root.userName;
            this.users = this.$root.users;

            this.$root.socket.on('messages', (messages) => {
                this.messages = messages;

                let messageDom = $('.messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
            });

            this.$root.socket.on('message', (message) => {
                this.messages.push(message);

                let messageDom = $('.messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
            });

            this.$root.$on('username_changed', this.userNameModified);
        }
    }
</script>
