<template>
    <section id="app-chat">
        <b-container class="p-0">
            <b-row class="pr-2 pl-3">
                <b-col cols="12" class="users-list">
                    <h5><b-icon-people flip-h></b-icon-people> Usuarios conectados:</h5>
                    <b-badge variant="secondary" class="p-1 ml-1 mr-1 cursor pointer" v-for="user in this.$root.users" v-bind:key="user.uuid" v-on:click="mentionUserName(user.userName)">
                        {{ user.userName }}
                    </b-badge>
                </b-col>
            </b-row>

            <b-row class="mt-2">
                <b-col cols="12" ref="chat-messages" class="chat-messages pr-0 pl-4" :style="'height: '+ chatHeight +'px'">
                    <div v-for="(message) in messages" v-bind:key="message.id" :id="'message-'+message.id">
                        <div v-if="message.type === 'connection'" :class="message.type">
                            <span>
                                <b-icon-forward-fill></b-icon-forward-fill>
                                <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> se ha conectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'disconnection'" :class="message.type">
                            <span>
                                <b-icon-forward flip-h></b-icon-forward>
                                <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> se ha desconectado.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'username_changed'" :class="message.type">
                            <span>
                                <b-icon-people flip-h></b-icon-people>
                                <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> ahora se llama <strong v-on:click="mentionUserName(message.content)" class="cursor pointer">{{ message.content }}</strong>.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'chat'" :class="message.type">
                            <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}:</strong>
                            <span v-html="message.content" v-linkified></span>
                        </div>
                        <div v-else-if="message.type === 'youtube'" :class="message.type">
                            <b-icon-collection-play></b-icon-collection-play>
                            <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> ha enviado un vídeo:
                            <youtube :video-id="message.videoId" :player-vars="message.playerVars"></youtube>
                        </div>
                        <div v-else-if="message.type === 'start_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video-fill></b-icon-camera-video-fill>
                               <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> ha comenzado a emitir.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'stop_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video flip-h></b-icon-camera-video>
                                <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> ha dejado de emitir.
                            </span>
                        </div>
                        <div v-else-if="message.type === 'admin_stop_broadcasting'" :class="message.type">
                            <span>
                                <b-icon-camera-video flip-h></b-icon-camera-video>
                                <strong v-on:click="mentionUserName(message.user.userName)" class="cursor pointer">{{ message.user.userName }}</strong> ha cerrado la retransmisión de {{ message.content }}.
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
                            <b-form-input ref="chat-input" class="message_input" autocomplete="off" autofocus v-model="message" placeholder="Type your message here..." />
                        </div>
                    </div>
                </b-form>
            </div>
        </b-container>
    </section>
</template>

<script>
    import SoundsComponent from '../plugins/sound.js'
    import EmojiComponent from '../plugins/emoji.js'
    import { getIdFromURL, getTimeFromURL } from 'vue-youtube-embed'

    const maxMessagesOnChatBuffer = 250;

    export default {
        data() {
            return {
                users: [],
                message: '',
                messages: [],
                chatHeight: 0,
                connected: false,
            }
        },
        methods: {
            sendMessage: function() {
                if (this.message === '' || this.$root.connected === false) {
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
            sendMentions: function(message) {
                if (message.type !== 'chat') {
                    return false;
                }

                let mentions = message.content.match(/(@[\w]+)/gm);
                if (!mentions || mentions.length === 0) {
                    return false;
                }

                let _this = this;
                let isMention = false;
                let alreadyNotified = [];
                let alreadyHighlighted = [];

                mentions.forEach(function(userName) {
                    let realUserName = userName.substring(1);
                    _this.$root.users.forEach(function(user) {
                        if(user.userName.toLowerCase() === realUserName.trim().toLowerCase()) {
                            let regexp = new RegExp("((?!\S*strong)("+ userName + "))", "gm");
                            message.content.match(regexp).forEach((value) => {
                                if (-1 === alreadyHighlighted.indexOf(realUserName)) {
                                    alreadyHighlighted.push(realUserName);
                                    message.content = message.content.replace(regexp, '<strong>' + value + '</strong>');
                                }
                            });

                            if(_this.$root.user.userName.toLowerCase() === realUserName.trim().toLowerCase() && -1 === alreadyNotified.indexOf(realUserName)) {
                                alreadyNotified.push(realUserName);
                                SoundsComponent.playNotificationSound();
                                _this.$root.$refs.notifications.sendNotification(
                                    'success',
                                    {
                                        type: 'chat_mention',
                                        content: message.user.userName
                                    }
                                );

                                isMention = true;
                            }
                        }
                    });
                });

                return isMention;
            },
            userNameModified: function() {
                this.$root.socket.emit('message', {
                    user: this.$root.user,
                    type: 'username_changed',
                    content: this.$root.user.userName
                });
            },
            updateChatHeight: function() {
                let fixedHeight = $('.chat-form').innerHeight() + $('#navbar').innerHeight() + $('.users-list').innerHeight();
                this.chatHeight = $(window).innerHeight() - fixedHeight + 35;
            },
            mentionUserName: function(userName) {
                let message = '@'+userName;
                if (this.message.length === 0) {
                    this.message = message + ': ';
                } else {
                    this.message += ' '+ message;
                }

                this.$refs['chat-input'].focus();
            },
            onMessage: function(message) {
                let isMention = this.sendMentions(message);
                if (message.content !== undefined) {
                    message.content = EmojiComponent.processText(message.content);
                }

                if (this.$root.chatSoundEnabled && false === isMention && this.$root.user.uuid !== message.user.uuid) {
                    SoundsComponent.playBeepSound();
                }

                let isYoutube = this.onYoutubeMessage(message);
                if (isYoutube && this.$root.chatEmbedVideoEnabled === true) {
                    message.type = 'youtube';
                    message.videoId = getIdFromURL(isYoutube[0]);
                    let start = getTimeFromURL(isYoutube[0]);
                    message.playerVars = {
                        start: start
                    };
                }

                this.messages.push(message);

                if (this.messages.length > maxMessagesOnChatBuffer) {
                    this.$refs['chat-messages'].getElementsByTagName('div')[0].remove();
                }

                let messageDom = $('.chat-messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
                this.updateChatHeight();
            },
            onMessages: function(messages) {
                messages.forEach(this.onMessage);

                let messageDom = $('.chat-messages');
                messageDom.animate({ scrollTop: messageDom.prop('scrollHeight') }, 300);
                this.updateChatHeight();
            },
            onYoutubeMessage: function(message) {
                if (message.type !== 'chat') {
                    return;
                }

                let regexp = new RegExp('^((?:https?:)?\\/\\/)?((?:www|m)\\.)?((?:youtube\\.com|youtu.be))(\\/(?:[\\w\\-]+\\?v=|embed\\/|v\\/)?)([\\w\\-]+)(\\S+)?$', 'gm');
                return message.content.match(regexp);
            }
        },
        watch: {
            users: function() {
                this.updateChatHeight()
            }
        },
        mounted: function() {
            this.connected = this.$root.connected;

            let _this = this;
            this.$root.$on('socket_connected', function() {
                _this.users = _this.$root.users;

                _this.$root.socket.on('messages', _this.onMessages);
                _this.$root.socket.on('message', _this.onMessage);
            });

            this.$root.$on('username_changed', this.userNameModified);
            this.updateChatHeight();

            $(window).resize(function() {
                _this.updateChatHeight();
            });
        }
    }
</script>
