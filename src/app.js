import Vue from 'vue';
import { Routes } from './routes';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
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
import randomWords from 'random-words';

import { SOCKET_ENDPOINT } from '../config';

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
        userName: null,
        user: {
            userName: null,
            streamId: null,
            uuid: null
        },
        mediaEnabled: false,
        chatSoundEnabled: false,
        forceNewUserNameOnJoin: true
    },
    methods: {
        refreshUserConnected: function(users) {
            this.users = users;
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

            this.socket.emit('user_connected', {
                userName: _this.user.userName.substring(0, 22)
            });
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
            _this.userName = user.userName;
            _this.user = user;
        });

        this.socket.on('user_disconnected', function(user) {
            _this.$emit('user_disconnected', user);
        });

        this.socket.on('users', this.refreshUserConnected);
        this.socket.on('users', function() {
            _this.$emit('users', _this.users);
        });

        this.$emit('user_connected');
    },
    router: Router
});

export default App;
