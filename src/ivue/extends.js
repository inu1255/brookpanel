import Vue from 'vue';
import * as utils from '../common/utils';
import { store } from '../common/store';
import './rules';
import * as ivue from './';
import config from '../common/config';

/**
 * @param {string} [name] 
 * @param {Function} fn 
 */
function loading(name, fn) {
	if (arguments.length < 2) fn = name, name = 'loading';
	if (this[name]) return;
	this[name] = true;
	var that = this;
	return Promise.resolve(fn.call(this)).then(function(data) {
		that[name] = false;
		return data;
	}, function(err) {
		that[name] = false;
		return Promise.reject(err);
	});
};

// 接口模块
utils.http.use(function(config, next) {
	config.withCredentials = true;
	return next(config).then(function(res) {
		if (res.status == 404)
			return Promise.reject({ no: 404, msg: '接口不存在' });
		if (res.status == 500)
			return Promise.reject({ no: 500, msg: '系统故障' });
		if (/json/.test(res.headers['content-type']))
			try {
				return JSON.parse(res.data);
			} catch (e) {
				return res;
			}
		return res;
	});
});
// middle: 模拟网速慢
// utils.http.use(function(config, next) {
// 	return utils.sleep(1e3).then(function() {
// 		return next(config);
// 	});
// });
// middle: 显示loading
utils.http.use(function(config, next) {
	var l = config.loading != false;
	l && store.loading++;
	return next(config).then(function(res) {
		l && --store.loading;
		return res;
	}, function(err) {
		l && --store.loading;
		return Promise.reject(err);
	});
});
// middle: 提示错误
utils.http.use(function(config, next) {
	return next(config).then(function(res) {
		if (!config.retErr && res && typeof res.no === "number" && res.no != 200)
			return Promise.reject(res);
		return res.data;
	}).catch(function(res) {
		if (res.no == 401) {
			if (!/(whoami|logout)$/.test(config.url))
				store.user.logout();
		}
		if (!config.ignore) ivue.toast.error(res.msg);
		return Promise.reject(res);
	});
});

// middle: api接口
utils.http.use(function(config, next) {
	if (!/^(http|\/)/.test(config.url)) {
		config.url = '/api/' + config.url;
		config.url += (config.url.indexOf("?") < 0 ? "?" : "&") + "token=" + encodeURIComponent(localStorage.getItem("token"));
	}
	return next(config);
});

Vue.prototype.$get = utils.http.get.bind(utils.http);
Vue.prototype.$post = utils.http.post.bind(utils.http);
Vue.prototype.$with = loading;
Vue.prototype.$user = store.user;
Vue.prototype.$size = store.size;
Vue.prototype.$config = config;
Vue.prototype.$utils = utils;