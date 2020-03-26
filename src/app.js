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

const socket = io();

const App = new Vue({
    el: '#app',
    components: {
        'app-header': HeaderComponent
    },
    data: {
        socket: socket,
        users: [],
        username: userName.join('_'),
        cameraId: null,
        microphoneId: null,
        mediaEnabled: false
    },
    methods: {
        refreshUserConnected: function(users) {
            console.log('Foo', users);
            this.users = users;
        }
    },
    mounted() {
        let _this = this;

        socket.on('users', this.refreshUserConnected);

        this.$on('camera_selected', function(device) {
            this.cameraId = device.deviceId;
        });

        this.$on('audio_selected', function(device) {
            this.microphoneId = device.deviceId;
        });

        this.$emit('user_connected');

        if (navigator.mediaDevices !== undefined) {
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: true })
                .then(function(mediaStream) {
                    _this.mediaEnabled = true;
                    console.log(mediaStream);
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    },
    router: Router
});
