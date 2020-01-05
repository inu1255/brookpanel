import Vue from 'vue';

const rules = {
	account(need, lbl = "账号") {
		return [
			need ? (v => !!v || `${lbl}是必填项`) : true,
			v => !v || /^\w+$/.test(v) || `${lbl}只能由字母和数字组成`,
		];
	},
	email(need, lbl = "邮箱") {
		return [
			need ? (v => !!v || `${lbl}是必填项`) : true,
			v => !v || /.+@.+\..+/.test(v) || `${lbl}格式不正确`,
		];
	},
	passwd(need, lbl = "密码") {
		return [
			need ? (v => !!v || `${lbl}是必填项目`) : true,
			v => !v || v.length >= 6 || `${lbl}至少6位`,
		];
	},
	price(need, lbl = '') {
		return [
			need ? (v => !!v || `${lbl}是必填项`) : true,
			v => !v || v >= 0 || `${lbl}不能为负数`
		];
	},
	need(lbl = '') {
		return [v => !!v || `${lbl}是必填项`];
	},
};

Vue.prototype.$rules = rules;
export default rules;