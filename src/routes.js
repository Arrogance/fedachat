import Index from './pages/index.vue';
import Terms from './pages/terms.vue';

import Storage from './plugins/storage/storage';
import { APP_REQUIRE_TERMS } from '../config';

let component = Index;
if (APP_REQUIRE_TERMS === true) {
    component = Storage.get('terms', false) ? Index : Terms;
}

export const Routes = [
    {
        path: '/',
        name: 'index',
        component: component
    }
];
