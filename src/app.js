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
import randomWords from 'random-words';
const socket = io();

const App = new Vue({
    el: '#app',
    components: {
        'app-header': HeaderComponent
    },
    data: {
        socket: socket,
        users: [],
        userName: null,
        user: null,
        cameraId: null,
        microphoneId: null,
        mediaEnabled: false
    },
    methods: {
        refreshUserConnected: function(users) {
            this.users = users;
        }
    },
    mounted() {
        let _this = this;

        if (this.userName === null) {
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

            this.userName = userName.join('_');
        }

        this.socket.emit('user_connected', {
            userName: _this.userName
        });

        this.$on('camera_selected', function(device) {
            this.cameraId = device.deviceId;
        });

        this.$on('audio_selected', function(device) {
            this.microphoneId = device.deviceId;
        });

        this.$on('username_changed', function() {
            this.user.userName = this.userName;
            this.socket.emit('user_modified', this.user);
        });

        this.socket.on('user_details', function(user) {
            _this.userName = user.userName;
            _this.user = {
                userName: user.userName,
                uuid: user.uuid
            };
        });

        this.socket.on('user_disconnected', function(user) {
            _this.$emit('user_disconnected', user);
        });

        this.socket.on('users', this.refreshUserConnected);

        this.$emit('user_connected');
    },
    router: Router
});

console.log(App);
