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
        username: userName.join('_')
    },
    methods: {
        addUserConnected: function(socket) {
            socket.emit('users', this.users);
        },
        refreshUserConnected: function(users) {
            console.log('Foo', users);
            this.users = users;
        }
    },
    mounted() {
        this.$emit('user_connected');
        this.addUserConnected(socket);

        socket.on('users', this.refreshUserConnected);
    },
    router: Router
});
