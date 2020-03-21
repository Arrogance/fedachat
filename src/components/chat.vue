<template>
    <section id="app-chat">
        <b-container>
            <b-form v-if="this.$root.username" v-on:submit.prevent="sendMessage">
                <b-row>
                    <b-col cols="10" class="p-0">
                        <ul class="messages">
                            <li v-for="m in messages" class="message left appeared">
                                <div class="text_wrapper">
                                    <div class="text" v-text="m"></div>
                                </div>
                            </li>
                        </ul>
                    </b-col>

                    <b-col cols="2">
                        <ul>
                            <li v-for="user in users">{{ user }}</li>
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
                let message = this.$root.username +': '+ this.message;
                this.$root.socket.emit('message', message);
                this.message = '';
            },
            userConnectedEvent: function() {
                let message = this.$root.username +' se ha conectado.';
                this.$root.socket.emit('message', message);
            },
            userNameModified: function(event) {
                let message = event.oldUsername +' ahora se llama '+this.$root.username;
                this.$root.socket.emit('message', message);
                this.$root.users = this.$root.users.filter(function(value) {
                    return value !== event.oldUsername;
                });

                this.$root.users.push(this.$root.username);
            }
        },
        mounted: function() {
            this.username = this.$root.username;
            this.users = this.$root.users;

            this.$root.socket.on('message', (message) => {
                this.messages.push(message);

                let messageDom = $('.messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
            });

            this.$root.$on('user_connected', this.userConnectedEvent);
            this.$root.$on('user_name_changed', this.userNameModified);
        }
    }
</script>
