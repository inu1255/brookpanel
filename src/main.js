import Vue from 'vue';
import * as utils from './common/utils';
import * as ivue from './ivue';
import App from './App.vue';
import router from './router';
import { store } from './common/store';
import vuetify from './vuetify';
import './vuetify';
import './styles/index.less';
import IView from './components';
Vue.use(IView);
window.utils = utils;
window.ivue = ivue;

Vue.use(Vuetify);
Vue.config.productionTip = false;
window.vue = new Vue({
	router,
	vuetify,
	data: store,
	render: h => h(App)
}).$mount('#app');