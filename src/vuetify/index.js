import Vue from 'vue';
import zhHans from 'vuetify/es5/locale/zh-Hans';
import Vuetify from 'vuetify';

import IvForm from './IvForm';
Vue.component('IvForm', IvForm);
import IvDate from './IvDate';
Vue.component('IvDate', IvDate);

export default new Vuetify({
	icons: {
		iconfont: 'mdi', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
	},
	lang: {
		locales: { zhHans },
		current: 'zhHans',
	},
	theme: {
		themes: {
			dark: {
				primary: "#2196F3",
				secondary: "#424242",
				accent: "#FF4081",
				error: "#FF5252",
				info: "#2196F3",
				success: "#4CAF50",
				warning: "#FB8C00"
			},
			light: {
				primary: "#1976D2",
				secondary: "#424242",
				accent: "#82B1FF",
				error: "#FF5252",
				info: "#2196F3",
				success: "#4CAF50",
				warning: "#FB8C00"
			}
		}
	}
});