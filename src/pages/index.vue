<template>
    <section id="index">
        <b-container fluid="">
            <b-row>
                <b-col md="8" sm="12" class="left-column show" ref="left-column">
                    <app-videos channel="fedachat"></app-videos>
                </b-col>

                <b-col md="4" sm="12" class="right-column" ref="right-column">
                    <app-chat></app-chat>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import VideosComponent from '../components/videos.vue'
    import ChatComponent from '../components/chat.vue'
    import randomWords from "random-words";
    import {SOCKET_ENDPOINT} from "../../config";

    export default {
        components: {
            'app-videos': VideosComponent,
            'app-chat': ChatComponent
        },
        methods: {
            toggleChat: function() {
                this.$refs['right-column'].classList.toggle('show');
                this.$refs['left-column'].classList.toggle('show');
            },
            refreshUserConnected: function(users) {
                this.$root.users = users;
                this.$root.$emit('users', this.$root.users);
            },
            startSocket: function() {
                let _this = this;

                _this.$root.connected = true;

                this.$root.socket.on('user_details', function(user) {
                    _this.$root.user = user;
                    _this.$root.$emit('user_stream_token', user.streamToken);
                });

                this.$root.socket.on('user_disconnected', function(user) {
                    _this.$root.$emit('user_disconnected', user);
                });

                this.$root.socket.on('users', this.refreshUserConnected);
                this.$root.socket.on('connect', function() {
                    _this.$root.socket.emit('user_connected', _this.$root.user);

                    _this.$root.$emit('user_connected');
                });

                this.$root.socket.on('disconnect', reason => {
                    if (reason === 'io server disconnect') {
                        _this.$root.socket.connect();
                    }

                    _this.$root.$refs.notifications.sendNotification('warning', 'disconnection');
                });

                this.$root.socket.on('reconnecting', () => {
                    _this.$root.$refs.notifications.sendNotification('info', 'reconnecting');
                });

                this.$root.socket.on('reconnect', () => {
                    _this.$root.$refs.notifications.sendNotification(
                        'success',
                        'connection_successful'
                    );
                });
            }
        },
        mounted() {
            this.$root.socket = io(SOCKET_ENDPOINT);
            this.$root.$emit('socket_connected');

            this.startSocket();

            if (this.$root.user.userName === null) {
                let userName = randomWords({
                    exactly: 3,
                    wordsPerString: 1,
                    formatter: (word, index) => {
                        return index === 0
                            ? word
                                .slice(0, 1)
                                .toUpperCase()
                                .concat(word.slice(1))
                            : word;
                    }
                });

                this.$root.user.userName = userName.join('_').substring(0, 22);
            }

            let _this = this;
            this.$root.$on('username_changed', function() {
                _this.$root.user.userName = _this.$root.user.userName.substring(0, 22);
                _this.$root.socket.emit('user_modified', _this.$root.user);
            });

            this.$root.$on('user_started_broadcasting', function(streamId) {
                _this.$root.user.streamId = streamId;
                _this.$root.socket.emit('user_modified', _this.$root.user);
            });

            this.$root.$on('user_stopped_broadcasting', function() {
                _this.$root.user.streamId = null;
                _this.$root.socket.emit('user_modified', _this.$root.user);
            });

            this.$root.$on('toggle_chat', this.toggleChat);
        }
    }
</script>
