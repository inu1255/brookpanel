import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import { store } from './common/store';
import { ua, wxLogin, decodeQuery, encodeURI } from './common/utils';
Vue.use(Router);

export const root = [{
	path: '/',
	alias: '/home',
	component: Home,
	meta: { full: true }
}, {
	path: '/view',
	component: () => import('./views/View.vue'),
	meta: { full: true }
}, ];

root.forEach(x => x.props = (route) => Object.assign({ path: x.path, meta: x.meta, name: x.name }, route.query, route.params));
var title = document.title;
const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: root,
});

/**
 * 单向绑定query参数
 * @template T
 * @param {T} params 
 * @param {boolean} [auto] 是否自动更新query
 * @returns {T}
 */
export function query(params, auto) {
	var data = {};
	var timeout;
	var query = {};
	Object.defineProperty(data, '$update', {
		value: function() {
			router.replace({ query: query });
		}
	});
	for (let k in params) {
		let value = params[k];
		Object.defineProperty(data, k, {
			configurable: true,
			enumerable: true,
			get: function() {
				var tmp = query[k];
				if (tmp == null) tmp = router.currentRoute.query[k];
				if (tmp == null) return value;
				try {
					tmp = decodeURIComponent(tmp);
					tmp = JSON.parse(tmp);
				} catch (err) {}
				return tmp;
			},
			set: function(v) {
				var tmp = encodeURI(typeof v === "string" ? v : JSON.stringify(v));
				if ((query[k] == null ? value : query[k]) != tmp) {
					query[k] = tmp;
					if (auto) {
						if (timeout) clearTimeout(timeout);
						timeout = setTimeout(function() {
							router.replace({ query: Object.assign({}, router.currentRoute.query, query) });
						});
					}
				}
			}
		});
	}
	return data;
};
Vue.prototype.$query = query;

router.beforeEach(function(to, from, next) {
	document.title = to.meta.title || title;
	console.log(to.path);
	if (to.query.token) {
		localStorage.setItem('token', to.query.token);
		delete to.query.token;
		return next(to);
	}
	if (to.path == '/login') {
		if (store.user.online)
			store.user.logout();
		else {
			var query = decodeQuery(location.search.slice(1));
			if (query.code)
				store.user.wxLoginOrRegister(query.code, { mp: true }).then(x => {
					if (!query.state) next({ path: '/' });
					else if (query.state.startsWith(ua.baseURL))
						next({ path: query.state.slice(ua.baseURL.length) });
					else location.href = query.state;
				}, _ => next());
			else
				next();
		}
		next();
	} else if (to.meta.login && !store.user.online) {
		if (store.user.online == null) // 不确定是否在线
			store.user.checkLogin().then(function(x) {
				return x ? next() : ua.wx ? wxLogin(ua.appid) : next({ path: '/login', query: { f: to.fullPath } });
			});
		else if (ua.wx) // 不在线
			wxLogin(ua.appid);
		else
			next({ path: '/login', query: { f: to.fullPath } });
	} else {
		next();
	}
});

export default router;