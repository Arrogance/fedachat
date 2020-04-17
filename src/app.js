import Vue from 'vue';
import { Routes } from './routes';

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import linkify from 'vue-linkify';
import VueYouTubeEmbed from 'vue-youtube-embed';

Vue.directive('linkified', linkify);
Vue.use(VueYouTubeEmbed);

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

import { APP_REQUIRE_USER, APP_REQUIRE_TERMS } from '../config';

const App = new Vue({
    el: '#app',
    components: {
        'app-header': HeaderComponent,
        'app-notifications': NotificationsComponent
    },
    data: {
        socket: null,
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
        chatEmbedVideoEnabled: Storage.get('chatEmbedVideoEnabled', true),
        connected: false,
        forceNewUserNameOnJoin: APP_REQUIRE_USER,
        userNameChangedTwice: APP_REQUIRE_USER !== true,
        userAcceptedTerms:
            APP_REQUIRE_TERMS === false ? true : Storage.get('terms', false)
    },
    router: Router
});

const reloadFunction = function() {
    location.reload();
};

Vue.config.errorHandler = reloadFunction;

export default App;
