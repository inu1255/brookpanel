import config from './config';

/**
 * @param {string} tag 
 * @return {HTMLElement}
 */
export function $(tag) {
	if (tag[0] == "<") {
		if (!$._div) $._div = document.createElement('div');
		$._div.innerHTML = tag;
		var div = $._div.children[0];
		return div;
	}
	return document.querySelector(tag);
};

/**
 * @param {HTMLElement} el
 * @param {string} cls
 */
export function animate(el, cls) {
	return new Promise(function(resolve) {
		el.classList.add(cls);
		el.classList.add(cls + '-active');
		setTimeout(function() {
			var styl = window.getComputedStyle(el);
			var delays = (styl.transitionDelay || styl.webkitTransitionDelay || '').split(', ');
			var durations = (styl.transitionDuration || styl.webkittransitionDuration || '').split(', ');
			var ms = delays.concat(durations).reduce(function(a, b) {
				return a + parseFloat(b) || 0;
			}, 0) * 1000;
			el.classList.replace(cls, cls + '-to');
			setTimeout(function() {
				el.classList.remove(cls + '-to');
				el.classList.remove(cls + '-active');
				resolve();
			}, ms);
		});
	});
};

/**
 * @param {string} str
 */
export function encodeURI(str) {
	return (str + '').replace(/%/g, '%25')
		.replace(/=/g, '%3D')
		.replace(/\?/g, '%3F')
		.replace(/\+/g, '%2B')
		.replace(/&/g, '%26');
};
/**
 * @return {string}
 */
export function encodeQuery(data) {
	var ss = [];
	for (var k in data) {
		var v = data[k];
		if (v == null) continue;
		if (typeof v === "object") v = JSON.stringify(v);
		ss.push(encodeURI(k) + '=' + encodeURI(v));
	}
	return ss.join('&');
};
/**
 * @param {string} str
 */
export function decodeQuery(str) {
	var data = {};
	var ss = str.split('&');
	for (var i = 0; i < ss.length; i++) {
		var s = ss[i].split('=');
		if (s.length != 2) continue;
		var k = decodeURIComponent(s[0]);
		var v = decodeURIComponent(s[1]);
		if (/^\[{/.test(v)) try { v = JSON.parse(v); } catch (e) {}
		data[k] = v;
	}
	return data;
};

/**
 * 获取距离1970-01-05(星期1)的天数
 * @param {Date} date 
 */
export function getDay(date) {
	if (!getDay._cache) getDay._cache = new Date('1970-01-05 00:00').getTime();
	return Math.floor((date.getTime() - getDay._cache) / 86400e3);
}

/**
 * 格式化时间显示
 * @param {string} format 
 * @param {number|Date} t 
 */
export function format(format, t) {
	if (typeof t === "number" && t < 1e10) {
		t *= 1e3;
	}
	t = new Date(t);
	if (!format) {
		let now = new Date();
		if (getDay(now) - getDay(t) == 1)
			format = '昨天 hh:mm';
		else if (t.getFullYear() != now.getFullYear())
			format = 'YYYY-MM-DD hh:mm';
		else if (t.getMonth() != now.getMonth() || t.getDate() != now.getDate())
			format = 'MM-DD hh:mm';
		else
			format = 'hh:mm';
	}
	var Y = (t.getFullYear() + 1e4).toString().slice(1);
	return format.replace(/YYYY/g, Y)
		.replace(/YY/g, Y.slice(2))
		.replace(/MM/g, (t.getMonth() + 101).toString().slice(1))
		.replace(/DD/g, (t.getDate() + 100).toString().slice(1))
		.replace(/hh/g, (t.getHours() + 100).toString().slice(1))
		.replace(/mm/g, (t.getMinutes() + 100).toString().slice(1))
		.replace(/ss/g, (t.getSeconds() + 100).toString().slice(1));
};

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--)
		u8arr[n] = bstr.charCodeAt(n);
	return new Blob([u8arr], { type: mime });
}

/**
 * 保存文件
 * @param {string|Blob} txt
 * @param {string} [name]
 */
export function download(txt, name) {
	if (/^(blob|https?):/.test(txt)) {
		var a = document.createElement('a');
		a.href = txt;
		a.download = name || '未命名.txt';
		a.click();
		return;
	}
	if (txt == "[object Blob]")
		return download(URL.createObjectURL(txt), name);
	if (/^data:/.test(txt))
		return download(dataURLtoBlob(txt), name);
	return download(new Blob([txt]), name);
};
/**
 * 复制字符串并返回是否复制成功
 * @param {string} str
 */
export function copy(str) {
	str = typeof str === "string" ? str : JSON.stringify(str);
	var success = false;
	try {
		var input = document.createElement('input');
		input.style.position = 'fixed';
		input.style.top = '-100px';
		input.value = str;
		document.body.appendChild(input);
		input.select();
		input.setSelectionRange(0, str.length);
		success = document.execCommand('copy');
		document.body.removeChild(input);
	} catch (error) {}
	return success;
};

/**
 * 选中节点
 * @param {HTMLElement} el 
 */
export function selectNode(el) {
	let selection = window.getSelection();
	selection.empty();
	let range = document.createRange();
	range.selectNode(el);
	selection.addRange(range);
}

/**
 * 获取文件
 * @param {string} [accept] 'image/png'
 * @param {boolean} [multiple] 
 * @returns {Promise<File|FileList>}
 */
export function pick(accept, multiple) {
	return new Promise(function(resolve, reject) {
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.accept = accept == "image" ? 'image/png|image/jpeg|image/gif' : accept;
		input.onchange = function(e) {
			resolve(multiple ? e.target.files : e.target.files[0]);
		};
		input.click();
		input.onabort = reject;
		input.oncancel = reject;
	});
};
/**
 * 读取文件
 * @param {File} file
 * @param {"ArrayBuffer"|"Binary​String"|"DataURL"|"base64"|"utf8"} [encoding]
 */
export function readFile(file, encoding) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		if (encoding && reader['readAs' + encoding])
			reader['readAs' + encoding](file);
		else
			reader.readAsText(file, encoding);
		reader.onload = function(e) {
			resolve(e.target.result);
		};
		reader.onerror = reject;
	});
};

/**
 * @returns {Promise<string>}
 */
export function pickImage() {
	return pick('image').then(function(file) {
		return readFile(file, 'DataURL');
	});
}

export const http = function() {
	/**
	 * 清理value中的null和undefined
	 * @param {any} value 
	 */
	function clear(value) {
		if (typeof value === "object" && !(value instanceof Array)) {
			var data = {};
			for (var k in value) {
				if (value[k] != null) {
					data[k] = clear(value[k]);
				}
			}
			return data;
		}
		return value;
	}
	/**
	 * @param {FetchOpt} config 
	 * @returns {Promise<FetchRes>}
	 */
	function ajax(config) {
		var xhr = new XMLHttpRequest();
		var i18 = config.i18 || { timeout: '请求超时', error: '无法连接网络', abort: '请求中止' };
		if (config.async === undefined) config.async = true;
		xhr.open(config.method, config.url, config.async, config.username, config.password);
		if (config.withCredentials) xhr.withCredentials = true;
		if (config.async) xhr.timeout = config.timeout;
		if (config.responseType) xhr.responseType = config.responseType;
		if (config.headers)
			for (var k in config.headers) {
				var v = config.headers[k];
				if (v instanceof Array)
					for (var i = 0; i < v.length; i++)
						xhr.setRequestHeader(k, v[i]);
				else
					xhr.setRequestHeader(k, v);
			}
		if (config.onUploadProgress)
			xhr.upload.onprogress = config.onUploadProgress;
		if (config.onDownloadProgress)
			xhr.onprogress = config.onDownloadProgress;
		var res;
		var pms = new Promise(function(resolve, reject) {
			xhr.ontimeout = xhr.onerror = xhr.onabort = function(e) {
				reject({ no: 500, config: config, msg: i18[e.type], type: e.type });
			};
			xhr.onload = function() {
				var headers = {};
				xhr.getAllResponseHeaders().split('\n').forEach(function(s) {
					var i = s.indexOf(':');
					if (i < 0) return;
					var k = s.slice(0, i);
					var v = s.slice(i + 1).trim();
					if (headers[k] instanceof Array) headers[k].push(v);
					else if (headers[k]) headers[k] = [headers[k], v];
					else headers[k] = v;
				});
				res = {
					status: xhr.status,
					statusText: xhr.statusText,
					headers: headers,
					data: xhr.response
				};
				resolve(res);
			};
		});
		xhr.send(config.body);
		if (config.cancelToken) config.cancelToken(xhr);
		return pms;
	}

	function Axios() {
		this.middles = [ajax];
	}
	Axios.prototype.request = function(config) {
		return this.middles[this.middles.length - 1](config);
	};

	/**
	 * @param {string} url
	 * @param {any} [data]
	 * @param {FetchOpt} [config] 
	 */
	Axios.prototype.get = function(url, data, config) {
		if (data) {
			data = clear(data);
			url += (url.indexOf('?') < 0 ? '?' : '&') + encodeQuery(data);
		}
		config = config || {};
		config.url = url;
		config.method = 'get';
		return this.request(config);
	};

	/**
	 * @param {string} url
	 * @param {any} [data]
	 * @param {FetchOpt} [config] 
	 */
	Axios.prototype.post = function(url, data, config) {
		config = config || {};
		if (typeof data === "object" && !(data instanceof FormData)) {
			data = clear(data);
			data = encodeQuery(data);
			if (!config.headers) config.headers = {};
			config.headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		}
		config.url = url;
		config.method = 'post';
		config.body = data;
		return this.request(config);
	};

	/**
	 * @param {FetchMiddle} fn 
	 */
	Axios.prototype.use = function(fn) {
		var prev = this.middles[this.middles.length - 1];
		this.middles.push(function(config) {
			return fn(config, prev);
		});
		return this;
	};

	Axios.prototype.create = function() {
		return new Axios();
	};

	return new Axios();
}();
/**
 * /foo/bar -> /foo
 * @param {string} url 
 */
export function dirname(url) {
	for (var i = url.length - 1; i >= 0; i--) {
		if (url[i] == '/')
			return url.slice(0, i);
	}
	return '';
};

/**
 * @param {ModuleFactory<EmscriptenWasm.Module>} moduleFactory 
 * @param {string} wasmUrl 
 * @returns {Promise}
 */
export function initWasmModule(moduleFactory, wasmUrl) {
	return new Promise((resolve) => {
		const module = moduleFactory({
			noInitialRun: true,
			locateFile(url) {
				if (url.endsWith('.wasm')) return wasmUrl;
				return url;
			},
			onRuntimeInitialized() {
				delete module.then;
				resolve(module);
			},
		});
	});
}

/**
 * 
 * @param {HTMLImageElement} image 
 */
export function toCanvas(image) {
	var canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0);
	return canvas;
}

/**
 * @param {HTMLCanvasElement} canvas 
 * @param {string} [type]
 * @param {any} [quality]
 */
export function toBlob(canvas, type, quality) {
	return new Promise(function(resolve, reject) {
		canvas.toBlob(resolve, type, quality);
	});
}

/**
 * 从URL中加载图片
 * @param {string} url 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
	return new Promise(function(resolve, reject) {
		var img = document.createElement('img');
		img.src = url;
		img.onload = resolve.bind(this, img);
		img.onerror = reject;
	});
}

export class Fileish extends Blob {
	constructor(data, name, opts) {
		super(data, opts);
		this.name = name;
	}
}

/**
 * @param {HTMLImageElement} img 
 */
export function readImageData(img) {
	var canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * @param {string} filename 
 */
export function extname(filename) {
	var type = filename.split('.');
	return type[type.length - 1];
}

/**
 * 调整src高宽，类似css中的background-size: contain
 * @param {Size} src 
 * @param {Size} dst 
 */
export function contain(src, dst) {
	try {
		var r = src.width / src.height;
		var w = r * dst.height;
		if (dst.width >= w) {
			src.width = w;
			src.height = dst.height;
		} else {
			src.width = dst.width;
			src.height = dst.width / r;
		}
	} catch (e) {}
}

/**
 * 调整src高宽，类似css中的background-size: cover
 * @param {Size} src 
 * @param {Size} dst 
 */
export function cover(src, dst) {
	var r = src.width / src.height;
	var w = r * dst.height;
	if (dst.width > w) {
		src.width = dst.width;
		src.height = dst.width / r;
	} else {
		src.width = w;
		src.height = dst.height;
	}
}

export function sleep(ms) {
	return new Promise(function(resolve) {
		setTimeout(resolve, ms);
	});
}

/**
 * 计算元素位置
 * @param {HTMLElement} el
 */
export function offset(el) {
	var box = el.getBoundingClientRect();
	return {
		top: box.top + window.pageYOffset - document.documentElement.clientTop,
		left: box.left + window.pageXOffset - document.documentElement.clientLeft,
		right: box.right,
		bottom: box.bottom
	};
}
/**
 * 
 * @param {HTMLElement} e 
 * @param {HTMLElement} p 
 */
export function isParent(e, p) {
	if (!e) return false;
	if (e == p) return e;
	return isParent(e.parentElement, p);
}

/**
 * 
 * @param {HTMLElement} el 
 * @param {MouseHandler} handler 
 * @return {MouseHandler}
 */
export function onmouse(el, handler) {
	var h = {};
	var command = false;
	for (var k in handler) {
		let v = handler[k];
		h[k] = function(e) {
			var evt = {};
			if (e.clientX != null) {
				var box = offset(el);
				// 转换为相对于el的坐标
				evt.x = e.clientX - box.left + window.scrollX;
				evt.y = e.clientY - box.top + window.scrollY;
				evt.buttons = e.buttons;
				evt.t = isParent(e.target, el);
				evt.wheelDelta = e.wheelDelta || (-e.detail * 24);
			} else {
				evt.keyCode = e.keyCode;
			}
			evt.ctrlKey = e.ctrlKey || command;
			evt.shiftKey = e.shiftKey;
			evt.altKey = e.altKey;
			evt.preventDefault = e.preventDefault.bind(e);
			v.call(handler, evt);
		};
	}
	if (handler.start) {
		el.addEventListener("mousedown", h.start);
		el.addEventListener("touchstart", h.start);
	}
	if (handler.move) {
		document.addEventListener("mousemove", h.move);
		document.addEventListener("touchmove", h.move);
	}
	if (handler.end) {
		document.addEventListener("mouseup", h.end);
		document.addEventListener("touchend", h.end);
	}
	if (handler.leave) {
		el.addEventListener("mouseleave", h.leave);
	}
	if (handler.enter) {
		el.addEventListener("mouseenter", h.enter);
	}
	if (handler.wheel) {
		el.addEventListener("mousewheel", h.wheel);
		el.addEventListener("DOMMouseScroll", h.wheel);
	}
	if (handler.keydown) {
		el.addEventListener("keydown", function(e) {
			if (e.keyCode == 91) command = true;
			h.keydown(e);
		});
	}
	if (handler.keyup) {
		el.addEventListener("keyup", function(e) {
			if (e.keyCode == 91) command = false;
			h.keyup(e);
		});
	}
	return h;
}

export function crop(img, x1, y1, x2, y2, bgColor) {
	var canvas = document.createElement('canvas');
	canvas.width = x2 - x1;
	canvas.height = y2 - y1;
	var ctx = canvas.getContext('2d');
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.drawImage(img, -x1, -y1);
	return canvas;
}

export function loadFont(name, timeout) {
	timeout = timeout || 30e3;
	return new Promise(function(resolve, reject) {
		var span = document.createElement('span');
		span.innerText = '你好giItT1WQy@!-/#';
		span.style.fontSize = '300px';
		span.style.fontFamily = 'sans-serif';
		span.style.position = 'fixed';
		span.style.top = '-10000px';
		document.body.appendChild(span);
		var w = span.clientWidth;
		span.style.fontFamily = name;
		var b = +new Date();
		var h = setInterval(() => {
			if (+new Date() - b > timeout) {
				reject();
				document.body.removeChild(span);
				clearTimeout(h);
			} else {
				if (w != span.clientWidth) {
					resolve();
					document.body.removeChild(span);
					clearTimeout(h);
				}
			}
		}, 100);
	});
}

export function resize(img, max, fit, bgColor) {
	var canvas = document.createElement('canvas');
	canvas.width = max.width;
	canvas.height = max.height;
	var width = img.naturalWidth || img.width;
	var height = img.naturalHeight || img.height;
	var size = { width, height };
	contain(size, max);
	if (fit) {
		canvas.width = size.width;
		canvas.height = size.height;
	}
	var x = (canvas.width - size.width) / 2;
	var y = (canvas.height - size.height) / 2;
	var ctx = canvas.getContext('2d');
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.drawImage(img, x, y, size.width, size.height);
	return canvas;
}

export function flipX(img) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = img.naturalWidth || img.width;
	canvas.height = img.naturalHeight || img.height;
	ctx.transform(-1, 0, 0, 1, canvas.width, 0);
	ctx.drawImage(img, 0, 0);
	return canvas;
}

export function flipY(img) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = img.naturalWidth || img.width;
	canvas.height = img.naturalHeight || img.height;
	ctx.transform(1, 0, 0, -1, 0, canvas.height);
	ctx.drawImage(img, 0, 0);
	return canvas;
}

/**
 * @param {HTMLImageElement} img 
 * @param {number} deg 
 */
export function rotate(img, deg) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var w = img.naturalWidth || img.width;
	var h = img.naturalHeight || img.height;
	var n = Math.sqrt(w * w + h * h);
	canvas.width = canvas.height = n;
	var x = (n - w) / 2;
	var y = (n - h) / 2;
	ctx.translate(n / 2, n / 2);
	ctx.rotate(deg / 180 * Math.PI);
	ctx.drawImage(img, x - n / 2, y - n / 2);
	var scale = img.width / img.naturalWidth;
	var rect = img.getBoundingClientRect();
	var rw = rect.width / scale;
	var rh = rect.height / scale;
	return crop(canvas, (n - rw) / 2, (n - rh) / 2, (n + rw) / 2, (n + rh) / 2);
}

export function addText(img, o) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var w = canvas.width = img.naturalWidth || img.width;
	var h = canvas.height = img.naturalHeight || img.height;
	ctx.drawImage(img, 0, 0);
	ctx.font = (16 / 240 * 400).toFixed(2) + "px Arial";
	ctx.strokeStyle = ctx.fillStyle = o.color || '#fff';
	var m = ctx.measureText(o.text);
	var x = (w - m.width) / 2;
	ctx.fillText(o.text, x, h - 12);
	return canvas;
}

export function limit(s, n) {
	return s ? s.length <= n ? s : s.slice(0, n - 2) + '..' : '';
}

export class Color {
	/**
	 * @param {string} s 
	 */
	constructor(s) {
		var color = [];
		if (s.startsWith('#')) {
			s = s.slice(1);
			if (s.length == 3) s += s;
			var v = parseInt(s, 16);
			while (v > 0) {
				color.unshift(v & 0xff);
				v >>= 8;
			}
			if (color[3]) color[3] /= 255;
		} else {
			s.replace(/\d+/g, function(v) {
				color.push(parseFloat(v));
			});
		}
		this.color = color;
	}
	brightness() {
		let [R, G, B] = this.color;
		return ((R * 299) + (G * 587) + (B * 114)) / 255000;
	}
	/**
	 * @param {Color|string} b 
	 */
	hover(b) {
		if (typeof b === "string") b = new Color(b);
		if (this.color[0] > 127) this.color[0] -= b.color[0];
		else this.color[0] += b.color[0];
		if (this.color[1] > 127) this.color[1] -= b.color[1];
		else this.color[1] += b.color[1];
		if (this.color[2] > 127) this.color[2] -= b.color[2];
		else this.color[2] += b.color[2];
		return this;
	}
	/**
	 * @param {Color|string} b 
	 */
	add(b) {
		if (typeof b === "string") b = new Color(b);
		this.color[0] += b.color[0];
		this.color[1] += b.color[1];
		this.color[2] += b.color[2];
		return this;
	}
	/**
	 * @param {Color|string} b 
	 */
	sub(b) {
		if (typeof b === "string") b = new Color(b);
		this.color[0] -= b.color[0];
		this.color[1] -= b.color[1];
		this.color[2] -= b.color[2];
		return this;
	}
	toString() {
		if (this.color.length == 3) return `rgb(${this.color})`;
		return `rgba(${this.color})`;
	}
}

export function measure(el) {
	var styl = window.getComputedStyle(el);
	var paddingLeft = parseFloat(styl.paddingLeft) || 0;
	var paddingRight = parseFloat(styl.paddingRight) || 0;
	var paddingTop = parseFloat(styl.paddingTop) || 0;
	var paddingBottom = parseFloat(styl.paddingBottom) || 0;
	var borderLeft = parseFloat(styl.borderLeft) || 0;
	var borderRight = parseFloat(styl.borderRight) || 0;
	var borderTop = parseFloat(styl.borderTop) || 0;
	var borderBottom = parseFloat(styl.borderBottom) || 0;
	var width = el.clientWidth - paddingLeft - paddingRight;
	var height = el.clientHeight - paddingTop - paddingBottom;
	return {
		paddingLeft,
		paddingRight,
		paddingTop,
		paddingBottom,
		borderLeft,
		borderRight,
		borderTop,
		borderBottom,
		width,
		height
	};
}

/**** 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 ****/
const CHARS = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
const NUMBERS = "0123456789";

/**
 * @param {number} len
 */
export function randomString(len) {
	var code = "";
	for (var i = 0; i < len; i++) {
		code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
	}
	return code;
}

/**
 * @param {number} len
 */
export function randomNumber(len) {
	var code = "";
	for (var i = 0; i < len; i++) {
		code += NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length));
	}
	return code;
}

/**
 * @param {number} max
 */
export function randN(max) {
	return Math.floor(Math.random() * max);
}

const iswx = navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0;
export const ua = {
	appid: 'wxaafbc399a80e1c49',
	iswx,
	wx: iswx && window.wx,
	ismb: /android|iphone|symbianos|windows phone|ipad|ipod/.test(navigator.userAgent.toLowerCase()),
	baseURL: location.protocol + '//' + location.host + (location.port ? ':' + location.port : location.port)
};

export function loadjs(url) {
	return new Promise(function(resolve, reject) {
		var script = document.createElement('script');
		script.onload = resolve;
		script.onerror = reject;
		script.src = url;
		document.head.appendChild(script);
	});
}

export function previewImage(urls) {
	if (wx) return wx.previewImage({
		current: urls[0].src || urls[0],
		urls: urls.map(x => x.src || x),
	});
	return open('i-image-preview', urls.map(x => typeof x === "string" ? { src: x } : x));
}

/**
 * 微信内登录
 * @param {string} appid 
 * @param {string} [url] 
 */
export function wxLogin(appid, url) {
	url = url || location.href;
	location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(ua.baseURL+'/login')}&response_type=code&scope=snsapi_base&state=${encodeURIComponent(url)}#wechat_redirect`;
}

export function stopClose(msg) {
	window.onbeforeunload = msg ? function(e) {
		var e = window.event || e;
		e.returnValue = msg;
	} : null;
}

export function remove(arr, obj) {
	var idx = arr.indexOf(obj);
	if (idx >= 0) arr.splice(idx, 1);
	return arr;
}

export function arr(val) {
	return val instanceof Array ? val : [val];
}

export class DataSource {
	constructor(query, isList) {
		this.query = query;
		this.isList = isList;
		this.options = {
			sortBy: [],
			sortDesc: [],
			page: 1,
			itemsPerPage: 10,
		};
		this.loading = false;
		this.list = [];
		this.total = 0;
		this.hasMore = true;
	}
	sortBy(val, desc) {
		val = arr(val);
		desc = !!desc;
		this.options.sortBy = val;
		this.options.sortDesc = val.map(() => desc);
		return this;
	}
	get totalPage() {
		return Math.ceil(this.total / this.options.itemsPerPage || 1);
	}
	async search(page) {
		let idx = page;
		if (page == null) idx = this.options.page - 1;
		if (idx < 0) idx = 0;
		if (this.loading) return;
		this.loading = true;
		try {
			let sortBy = this.options.sortBy.join(',');
			if (!sortBy) sortBy = null;
			let desc = this.options.sortDesc[0];
			if (sortBy == null || !desc) desc = null;
			else desc = 1;
			let pageSize = this.options.itemsPerPage;
			let { total, list } = await this.query({ page: idx, sortBy, desc, pageSize: pageSize == 10 ? null : pageSize });
			this.total = total;
			if (idx == 0 || !this.isList) {
				this.list = list;
			} else {
				this.list = this.list.concat(list);
			}
			if (typeof total === "number")
				this.hasMore = (idx + 1) * pageSize < this.total;
			else
				this.hasMore = this.list.length;
			if (page != null)
				console.log('idx:', this.options.page = idx + 1);
		} catch (error) {
			this.loading = false;
			throw error;
		}
		this.loading = false;
	}
	update(e) {
		this.options = Object.assign({}, this.options, e);
		return this.search();
	}
	loadmore() {
		this.isList = true;
		this.search(this.options.page);
	}
	next() {
		this.options.page++;
	}
	prev() {
		if (this.options.page > 1)
			this.options.page--;
	}
}

export function opts(arr, canAll) {
	var opts = [];
	if (canAll) opts.push({ text: typeof canAll === 'string' ? canAll : '全部', value: null });
	for (let i = 0; i < arr.length; i++) {
		let text = arr[i];
		opts.push({ text, value: i });
	}
	return opts;
}

/**
 * 
 * @param {any[]} list 
 * @param {any[]} data 
 * @param {string} key 
 * @param {string} [foreignKey] 
 */
export function leftJoin(list, data, key, foreignKey) {
	foreignKey = foreignKey || key + '_id';
	let map = {};
	for (let item of data) {
		map[item.id] = item;
	}
	for (let item of list) {
		let id = item[foreignKey];
		item[key] = map[id] || { id };
	}
}

export function os(ua) {
	ua = ua || navigator.userAgent;
	let oss = {
		微信: /micromessenger/i,
		WP: /windows phone/i,
		Mac: /os x/i,
		Android: /Android/i,
		Linux: /linux/i,
		iPhone: /\(iPhone.*os (\d+)[._](\d+)/i,
		iPad: /\(iPad.*os (\d+)[._](\d+)/i,
		iOS: /ios/i,
		ChromeOS: /cros/i,
		Windows10: /windows nt 10\.0/i,
		Windows8: /windows nt 6\.[23]/i,
		Windows7: /windows nt 6\.1/i,
		WindowsVista: /windows nt 6\.0/i,
		Windows2003: /windows nt 5\.2/i,
		WindowsXP: /windows nt 5\.1/i,
		Windows2000: /windows nt 5\.0/i,
		Windows: /windows nt/i,
		Wii: /wii/i,
		PS3: /playstation 3/i,
		PSP: /playstation portable/i,
		Bada: /Bada\/(\d+)\.(\d+)/i,
		Curl: /curl\/(\d+)\.(\d+)\.(\d+)/i
	};
	for (let k in oss) {
		let v = oss[k];
		if (v.test(ua)) return k;
	}
	return '未知';
}

/**
 * 修改body, 去掉keys和undefine
 * @template T
 * @param {T} body 
 * @param {string[] | { [key: string]: any }} keys 
 * @returns {T}
 */
export function clearKeys(body, keys) {
	if (keys instanceof Array) { // 清除keys中的字段
		for (let key of keys) {
			delete body[key];
		}
	} else { // 清除与keys值相同的字段
		for (let k in body) {
			let v = body[k];
			if (keys[k] == v || v === undefined) delete body[k];
		}
	}
	return body;
}

export function isEmpty(obj) {
	if (!obj) return true;
	let ok = true;
	for (let k in obj) {
		ok = false;
		break;
	}
	return ok;
}

export function githubLogin() {
	let client_id = config.github.client_id;
	let redirect_uri = location.origin + '/api/oauth2/github?from=' + encodeURIComponent(location.href.endsWith('/login') ? location.origin : location.href);
	location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
}

export function findNext(text, s, i, pars) {
	if (!pars)
		pars = {
			'"': '"\\',
			"'": "'\\",
			"`": "`\\",
			"{": "}",
			"(": ")",
			"[": "]",
			"/": ["/", "\\", /[^\w)]/],
			"//": "\n",
			"/*": ["*/"]
		};
	var stack = [];
	var prev;
	while (i < text.length) {
		var p = stack[stack.length - 1];
		var c = text[i];
		if (p) {
			let p0 = p[0];
			let p1 = p[1];
			if (text.substr(i, p0.length) == p0)
				stack.pop(), i += p0.length - 1;
			else if (p1)
				c == p1 && (i++);
			else {
				var v = pars[text.substr(i, 2)];
				if (v && (!v[2] || v[2].test(prev)))
					stack.push(v), i++;
				else if ((v = pars[c]) && (!v[2] || v[2].test(prev)))
					stack.push(v);
			}
		} else {
			if (text.substr(i, s.length) == s)
				break;
			var v = pars[text.substr(i, 2)];
			if (v && (!v[2] || v[2].test(prev)))
				stack.push(v), i++;
			else if ((v = pars[c]) && (!v[2] || v[2].test(prev)))
				stack.push(v);
		}
		if (!/\s/.test(c)) prev = c;
		i++;
	}
	return i;
}

/**
 * 
 * @param {string} text 
 * @returns {soulsign.Task<any>}
 */
export function compileTask(text) {
	let beg = text.indexOf('==UserScript==');
	let end = text.indexOf('==/UserScript==');
	if (beg < 0 || end < 0 || beg > end)
		return;
	let task = { code: text };
	text = text.slice(beg + 14, end);
	text = text.replace(/\n\s*\/\/ ?/g, '\n');
	let lines = text.split(/\n\s*@/);
	lines = lines.map(x => x.trim()).filter(x => x);
	for (let line of lines) {
		let m = /\w+\s*/.exec(line);
		if (m) {
			let name = m[0];
			let value = line.slice(name.length).replace(new RegExp(Array.from({ length: name.length + 1 }).fill(' ').join(''), 'g'), '').trim();
			name = name.trim();
			let one = task[name];
			if (one) {
				let ones = task[name + 's'];
				if (ones)
					ones.push(value);
				else
					task[name + 's'] = [one, value];
			}
			task[name] = value;
		}
	}
	if (!task)
		throw ('格式非法,找不到==UserScript==区域');
	if (!task.author)
		task.author = '';
	if (!task.name)
		throw ('缺少@name');
	if (!task.domain)
		throw ('缺少@domain');
	else if (!task.domains)
		task.domains = [task.domain];
	if (task.grant && !task.grants)
		task.grants = task.grant.split(',');
	if (!task.grants) task.grants = [];
	if (task.param && !task.params)
		task.params = [task.param];
	if (task.params) task.params = task.params.map(x => {
		var ss = x.split(/\s+/);
		if (ss.length < 2) ss[1] = '';
		return [ss[0], ss.slice(1).join(' ')];
	});
	if (!task.params) task.params = [];
	delete task.param;
	delete task.domain;
	task.expire = +task.expire || 900e3;
	task.enable = false;
	var m = /exports\.run\s*=[^{]+/.exec(task.code);
	if (m) {
		var e = findNext(task.code, '}', m.index + m[0].length + 1);
		task.run = task.code.slice(m.index + m[0].length + 1, e).trim();
	}
	var m = /exports\.check\s*=[^{]+/.exec(task.code);
	if (m) {
		var e = findNext(task.code, '}', m.index + m[0].length + 1);
		task.check = task.code.slice(m.index + m[0].length + 1, e).trim();
	}
	return task;
}