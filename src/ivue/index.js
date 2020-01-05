import Vue from 'vue';
import './extends';
import './filters';
import './directive';
import { pushIndex } from '../components/zindex';
import { $, animate } from '../common/utils';
import AppMsg from '../vuetify/IAppMsg';
import AppForm from '../vuetify/IAppForm';
import vuetify from '../vuetify';

/**
 * @template T
 * @param {T} v
 * @param {(val:T,old:T)=>any} [fn]
 * @returns {T}
 */
export function watch(v, fn) {
	return new Vue({ data: { v: v }, watch: fn && { v: { deep: true, handler: fn } } }).v;
};

/**
 * 可以操作localStorage/sessionStorage
 * 自带缓存: 多次读取只会JSON.parse一次
 *         多次同步写入只会JSON.stringify一次
 * @example
 * /// 创建
 * var user = utils.store.session('user', {id: 2, name: 'abc'}) 
 * /// 读取
 * user.name 
 * /// 相当于
 * JSON.parse(sessionStorage.user).name
 * /// 写入
 * user.id = 1
 * user.name = '123'
 * /// 相当于
 * var user = JSON.parse(sessionStorage.user)
 * user.id = 1
 * user.name = '123'
 * sessionStorage.user = JSON.stringify(user)
 */
export const storage = function() {
	var map = {};

	/**
	 * 创建存储
	 * @template T
	 * @param {string} key 
	 * @param {T} [def={}]
	 * @param {Storage} [storage]
	 * @returns {T}
	 */
	function create(key, def, storage) {
		if (map[key]) return map[key];
		def = def || {};
		if (!storage) return map[key] = def;
		try { def = Object.assign(def, JSON.parse(storage.getItem(key))); } catch (e) {}
		return map[key] = watch(def, function(val) {
			storage.setItem(key, JSON.stringify(val));
		});
	}

	/**
	 * 创建/获取存储
	 * @template T
	 * @param {string} key 
	 * @param {T} [def={}]
	 * @returns {T}
	 */
	function local(key, def) {
		return create(key, def, localStorage);
	}

	/**
	 * 创建/获取会话存储
	 * @template T
	 * @param {string} key 
	 * @param {T} [def={}]
	 * @returns {T}
	 */
	function session(key, def) {
		return create(key, def, sessionStorage);
	}
	return {
		local: local,
		session: session,
	};
}();

/**
 * 
 * @param {string|VueComponent} comp 
 * @param {any} props
 * @param {{title: string; props: {}}} [options] 
 */
export function open(comp, props, options) {
	options = options || {};
	if (props == null || typeof props != "object") props = { value: props };
	else if (props.value == null) props.value = '';
	return new Promise(function(resolve, reject) {
		var cb = resolve;
		var vue = new Vue({
			data: {
				show: true
			},
			watch: {
				show() {
					if (this.show) return;
					cb(props.value);
					vue.$destroy();
					document.body.removeChild(vue.$el);
				}
			},
			render(h) {
				let children = [h(comp, {
					on: {
						input(v) {
							props.value = v;
							if (!options.showClose) vue.show = false;
						},
						change(v) {
							props.value = v;
							vue.show = false;
						},
						close() {
							vue.show = false;
						},
						cancel(v) {
							cb = reject;
							props.value = v;
							vue.show = false;
						},
						submit(v) {
							cb = resolve;
							props.value = v;
							vue.show = false;
						}
					},
					props: props,
				})];
				if (options.showClose)
					children.push(h('span', { attrs: { slot: 'footer' }, slot: 'footer' }, [
						h('v-btn', { props: { size: 'mini' }, on: { click() { cb = reject, vue.show = false; } } }, options.failureText || '取消'),
						h('v-btn', { props: { size: 'mini', type: 'primary' }, on: { click() { cb = resolve, vue.show = false; } } }, options.successText || '确定'),
					]));
				return h('i-modal', {
					props: Object.assign({}, options, { open: this.show }),
					on: {
						"update:open"(v) {
							if (v) return;
							cb = reject;
							props.value = '关闭弹窗';
							vue.show = false;
						}
					}
				}, children);
			}
		});
		vue.$mount();
		document.body.appendChild(vue.$el);
	});
}

class Toast {
	constructor() {
		this.prev_end_at = 0;
	}
	_show(tips, msg, par) {
		return new Promise(function(resolve, reject) {
			var div = $('<div><div class="' + par.color + '-tip" style="border-radius:0.438rem;margin-bottom:8px;padding:3px 8px;display:inline-block;">' + msg + '</div></div>');
			animate(div, 'it-fade-enter');
			tips.appendChild(div);
			setTimeout(function() {
				animate(div, 'it-fade-leave').then(function() {
					div.remove();
					resolve();
				});
			}, par.timeout);
		});
	}
	/**
	 * @param {string} msg
	 * @param {string} [color]
	 * @param {number} [timeout]
	 */
	_show_vuetify(tips, msg, par) {
		return new Promise(function(resolve, reject) {
			function update() {
				setTimeout(function() {
					vue.$destroy();
					resolve();
				}, 300);
			}
			let vue = new Vue({
				data: {
					show: true,
				},
				watch: {
					show: update,
				},
				render(h, hack) {
					return h('v-snackbar', {
						props: { right: true, ...par, value: this.show },
						on: { input: update },
						staticStyle: { position: 'static', marginBottom: '8px' }
					}, [msg, h('v-btn', {
						props: { color: par.btnColor, text: true },
						on: {
							click: () => this.show = false,
						}
					}, ['Close'])]);
				},
			});
			vue.$mount();
			tips.appendChild(vue.$el);
		});
	}
	/**
	 * @param {string} msg
	 * @param {ToastOptions} [par]
	 */
	message(msg, par) {
		var now = +new Date();
		msg = msg + "";
		if (typeof par.timeout != "number") // 默认停留时间与消息长度相关
			par.timeout = 1e3 + msg.length * 200;
		if (this.prev_end_at > now) // 如果上个消息还没结束
			par.timeout += this.prev_end_at - now;
		this.prev_end_at = now + par.timeout;
		var tips = $('#tips');
		if (!tips) {
			tips = $('<div id="tips" style="position:fixed;font-size:14px;top:8px;left:8px;right:8px;text-align:center;"></div>');
			($("#app") || document.body).appendChild(tips);
		}
		pushIndex(tips);
		if (!par) par = {};
		if (window.Vuetify) return this._show_vuetify(tips, msg, par);
		return this._show(tips, msg, par);
	}
	/**
	 * @param {string} msg
	 * @param {number} [timeout]
	 */
	error(msg, timeout) {
		return this.message(msg, { color: 'error', timeout });
	}
	/**
	 * @param {string} msg
	 * @param {number} [timeout]
	 */
	success(msg, timeout) {
		return this.message(msg, { color: 'success', timeout });
	}
	/**
	 * @param {string} msg
	 * @param {number} [timeout]
	 */
	info(msg, timeout) {
		return this.message(msg, { color: 'info', timeout });
	}
}

export const toast = new Toast();

/**
 * 弹出
 * @param {MessageConfig} config
 * @returns {Promise<string>}
 */
export function dialog(config) {
	return new Promise(function(resolve, reject) {
		let props = Object.assign({
			successText: "确定",
			failureText: "",
			text: "",
			title: "",
			titleClass: "",
			input: false,
		}, config);
		if (!props.width)
			props.width = Math.min(Math.max(props.text.length * 14 + 50, 300), 560);
		let root = $("#app") || document.body;
		let clear = function() {
			vue.$destroy();
			root.removeChild(vue.$el);
		};
		let vue = new Vue({
			vuetify,
			render(h) {
				return h(AppMsg, {
					props,
					on: {
						success(v) {
							resolve(v);
							setTimeout(clear, 300);
						},
						failure(v) {
							reject(v);
							setTimeout(clear, 300);
						},
					},
				});
			},
		});
		vue.$mount();
		root.appendChild(vue.$el);
	});
}

/**
 * @param {string} text
 * @param {string} title
 * @param {MessageConfig} [config]
 */
export function alert(text, title, config) {
	if (typeof title == "object") {
		config = title;
		title = config.title;
	}
	config = config || {};
	config.text = text;
	config.title = title;
	config.successText = config.successText || '知道了';
	return dialog(config);
}
/**
 * @param {string} text
 * @param {string} title
 * @param {MessageConfig} [config]
 */
export function confirm(text, title, config) {
	if (typeof title == "object") {
		config = title;
		title = config.title;
	}
	config = config || {};
	config.text = text;
	config.title = title;
	config.failureText = config.failureText || '取消';
	return dialog(config);
}
/**
 * @param {string} text
 * @param {string} title
 * @param {MessageConfig} [config]
 */
export function prompt(text, title, config) {
	if (typeof title == "object") {
		config = title;
		title = config.title;
	}
	config = config || {};
	config.text = text;
	config.title = title;
	config.failureText = config.failureText || '取消';
	config.input = true;
	return dialog(config);
}

/**
 * 
 * @template T
 * @param {FormConfig<T>} props 
 * @returns {{[key in T]:any}}
 */
export function form(props) {
	return new Promise(function(resolve, reject) {
		let root = $("#app") || document.body;
		let clear = function() {
			vue.$destroy();
			root.removeChild(vue.$el);
		};
		let vue = new Vue({
			vuetify,
			render(h, hack) {
				return h(AppForm, {
					props,
					on: {
						cancel(v) {
							reject(v);
							setTimeout(clear, 300);
						},
						submit(v) {
							resolve(v);
							setTimeout(clear, 300);
						},
					}
				});
			}
		});
		vue.$mount();
		root.appendChild(vue.$el);
	});
}

export function paste() {
	return new Promise(function(resolve, reject) {
		let div = document.createElement('div');
		div.setAttribute('style', 'width:100vw;height:100vh;position:fixed;top:0;left:0;background:rgba(0,0,0,.7);color:#fff;font-size:32px;z-index:10000;text-align:center;line-height:100vh;');
		let key = /macintosh|mac os x/i.test(navigator.userAgent) ? 'cmd' : 'ctrl';
		div.innerHTML = `请按下<kbd>${key}</kbd>+<kbd>v</kbd>`;
		document.body.appendChild(div);
		let close = () => {
			document.removeEventListener('paste', success);
			document.removeEventListener('click', failure);
			document.body.removeChild(div);
		};
		let success = e => {
			resolve(e.clipboardData.getData('text/plain'));
			close();
		};
		let failure = e => {
			reject('用户放弃读取剪切板');
			close();
		};
		document.addEventListener('paste', success);
		setTimeout(function() {
			document.addEventListener('click', failure);
		}, 300);
	});
}

Vue.prototype.$msg = {
	alert,
	prompt,
	confirm,
};

Vue.prototype.$toast = toast;