import router from '../router.js';
import { http } from './utils.js';

export class User {
	constructor() {
		this.info = null;
		this.online = null;
		this.lvl = null;
		this.umap = {};
	}
	/**
	 * 
	 * @param {User[]} list 
	 */
	addcache(list) {
		list && list.forEach(item => item && (this.umap[item.id] = item));
	}
	get(id, name) {
		return this.umap[id] || { id: 0, lvl: 1000, name: name || '-', avatar: 'http://lorempixel.com/64/64/?' + Math.random() };
	}
	adm() {
		return this.info && this.info.lvl < 1;
	}
	setInfo(info) {
		this.info = info;
		if (info == null) {
			this.online = false;
			this.lvl = null;
			this.id = 0;
		} else {
			this.umap[info.id] = info;
			this.lvl = info.lvl;
			this.id = info.id;
		}
	}
	login(body, loading) {
		if (loading === null)
			loading = false;
		var that = this;
		return http.post('user/login', body, { loading: loading }).then(function(info) {
			that.setInfo(info);
			that.online = true;
			return info;
		});
	}
	wxLogin(code, conf) {
		conf = conf || {};
		if (conf.loading === null)
			conf.loading = false;
		var that = this;
		return http.get('user/wx_login', { code, type: conf.mp ? 1 : 0 }, { loading: conf.loading }).then(function(info) {
			if (info.id) {
				that.setInfo(info);
				that.online = true;
			}
			return info;
		});
	}
	wxLoginOrRegister(code, conf) {
		var that = this;
		return this.wxLogin(code, conf).then(function(info) {
			if (info.id) return info;
			return that.register({
				account: info.unionid,
				passwd: Date.now().toString(36),
				invite: null,
			});
		});
	}
	register(body, loading) {
		if (loading === null)
			loading = false;
		var that = this;
		return http.post('user/register', body, { loading: loading }).then(function(info) {
			that.setInfo(info);
			that.online = true;
			return info;
		});
	}
	logout(path) {
		this.online = false;
		var that = this;
		http.get('user/logout', null, { loading: false, ignore: true }, function() {
			that.setInfo(null);
		}).catch(function() {});
		if (path === true)
			router.push('/login?f=' + router.currentRoute.fullPath);
		else if (path)
			router.push(path);
	}
	checkLogin(force) {
		if (this.online != null) return Promise.resolve(this.online);
		var that = this;
		return http.get('user/whoami', { force: force }, { ignore: true }).then(function(info) {
			that.setInfo(info);
			return that.online = true;
		}).catch(function(error) {
			console.log(error);
			return that.online = false;
		});
	}
}

export class ScreenSize {
	constructor() {
		let resize = _ => {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			this.sm = window.innerWidth >= 600;
			this.md = window.innerWidth >= 960;
			this.lg = window.innerWidth >= 1264;
			this.xl = window.innerWidth >= 1904;
		};
		resize();
		window.addEventListener('resize', resize);
	}
	/**
	 * @param {number} width 默认宽度
	 * @param {number} min 最小字号
	 * @param {number} [unit] 默认宽度下的字号
	 */
	rem(width, min, unit) {
		if (!min || min < 12) min = 12;
		if (!unit) unit = 16;
		if (width <= 0)
			width = window.innerWidth;
		var reset = () => {
			this.scale = window.innerWidth / width;
			this.size = Math.max(this.scale * unit, min);
			document.querySelector('html').style.fontSize = this.size + 'px';
		};
		reset();
		window.addEventListener('orientationchange', reset);
		window.addEventListener('resize', reset);
		return this;
	}
}

export class Store {
	constructor() {
		this.user = new User();
		this.size = new ScreenSize();
		this.loading = 0; // 加载中modal
		this.r = 0; // 请求数量
		this.p = null; // 上传中
	}
}

export const store = new Store();