import Vue from 'vue';
import { Routes } from './routes';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import linkify from 'vue-linkify';

Vue.directive('linkified', linkify);

import '../style/app.scss';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

const Router = new VueRouter({
    routes: Routes,
    mode: 'history'
});

Vue.use(VueRouter);

import HeaderComponent from './components/header.vue';
import NotificationsComponent from './components/notifications.vue';
import Storage from './plugins/storage/storage';
import randomWords from 'random-words';

import { SOCKET_ENDPOINT, APP_REQUIRE_USER } from '../config';

const socket = io(SOCKET_ENDPOINT);

const App = new Vue({
    el: '#app',
    components: {
        'app-header': HeaderComponent,
        'app-notifications': NotificationsComponent
    },
    data: {
        socket: socket,
        users: [],
        user: {
            userName: null,
            streamId: null,
            streamToken: null,
            uuid: null
        },
        mediaEnabled: false,
        audioEnabled: false,
        chatSoundEnabled: Storage.get('chatSoundEnabled', true),
        connected: false,
        forceNewUserNameOnJoin: APP_REQUIRE_USER
    },
    methods: {
        refreshUserConnected: function(users) {
            this.users = users;
            this.$emit('users', this.users);
        }
    },
    mounted() {
        let _this = this;

        if (this.user.userName === null) {
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

            this.user.userName = userName.join('_').substring(0, 22);
        }

        this.$on('username_changed', function() {
            this.user.userName = this.user.userName.substring(0, 22);
            this.socket.emit('user_modified', this.user);
        });

        this.$on('user_started_broadcasting', function(streamId) {
            this.user.streamId = streamId;
            this.socket.emit('user_modified', this.user);
        });

        this.$on('user_stopped_broadcasting', function() {
            this.user.streamId = null;
            this.socket.emit('user_modified', this.user);
        });

        this.socket.on('user_details', function(user) {
            _this.user = user;
            _this.$emit('user_stream_token', user.streamToken);
        });

        this.socket.on('user_disconnected', function(user) {
            _this.$emit('user_disconnected', user);
        });

        this.socket.on('users', this.refreshUserConnected);
        this.socket.on('connect', function() {
            _this.socket.emit('user_connected', _this.user);
            _this.$emit('user_connected');
        });

        this.socket.on('disconnect', reason => {
            if (reason === 'io server disconnect') {
                socket.connect();
            }

            _this.$refs.notifications.sendNotification('warning', 'disconnection');
        });

        this.socket.on('reconnecting', () => {
            _this.$refs.notifications.sendNotification('info', 'reconnecting');
        });

        this.socket.on('reconnect', () => {
            _this.$refs.notifications.sendNotification(
                'success',
                'connection_successful'
            );
        });
    },
    router: Router
});

const reloadFunction = function() {
    location.reload();
};

Vue.config.errorHandler = reloadFunction;

export default App;
