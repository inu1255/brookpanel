<template>
	<v-dialog :value="open" @input="cancel" :width="width" persistent>
		<v-card>
			<v-card-title>{{title}}</v-card-title>
			<v-card-text>
				<v-form ref="form" lazy-validation>
					<template v-for="p in plist">
						<component :is="p.view" v-model="body[p.key]" v-bind="p.props" v-on="p.on"></component>
					</template>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn :color="failureColor" text @click="cancel">{{failureText}}</v-btn>
				<v-btn :color="successColor" text @click="submit">{{successText}}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
const typeView = {
}
export default {
	name: "IAppForm",
	props: {
		params: { required: true },
		value: {},
		width: { default: 600 },
		title: String,
		successColor: { type: String, default: 'success' },
		successText: { type: String, default: '确定' },
		failureColor: { type: String, default: 'grey' },
		failureText: { type: String, default: '取消' },
	},
	data() {
		let body = {}
		for (let k in this.params) {
			let v = this.params[k]
			body[k] = v.def == null ? null : v.def;
		}
		Object.assign(body, this.value)
		return {
			body,
			open: true,
		}
	},
	computed: {
		plist() {
			let list = []
			for (let k in this.params) {
				let v = this.params[k]
				let { need, def, lbl, rem, type: typ, view, reg, opts, enum: enu, range, len,
					rules, props, on } = v;
				props = props || {}
				if (on) for (let k in on) {
					if (typeof on[k] === "function") on[k] = on[k].bind(this.body)
				}
				let name = lbl || rem || k;
				let items
				let type;
				if (opts) {
					if (typeof opts[0] == "string") items = opts.map((text, value) => ({ text, value }))
					else items = opts;
					if (!view) view = 'v-select';
				} else if (enu) {
					items = opts.map((text) => ({ text, value: text }))
					if (!view) view = 'v-select';
				}
				if (/float|int/.test(typ)) type = 'number'
				props.label = name;
				props.rules = [(value) => {
					let body = this.body;
					// 以下与 green.ts 同步
					if (value == null || value === "") {
						if (need instanceof Array) {
							for (let i = 0; i < need.length; i++) {
								if (body[need[i]] == null)
									return `${name}是必填项`;
							}
						}
						else if (typeof need === "string" ? body[need] == null : need)
							return `${name}是必填项`;
					} else {
						if (typ && value != null) {
							switch (typ) {
								case "int":
									if (value == 'true') value = 1;
									else if (value == 'false') value = 0;
									value = +value;
									if (isNaN(value)) return `${name}必须是整数`;
									body[k] = Math.floor(value);
									break;
								case "float":
									value = +value;
									if (isNaN(value)) return `${name}必须是数字`;
									body[k] = value;
									break;
								case "array":
									if (typeof value !== "object") {
										try {
											value = body[k] = JSON.parse(value);
										} catch (error) {
											return `${name}类型必须是array`;
										}
									}
									if (!(value instanceof Array)) return `${name}必须是数组`;
									break;
								case "str":
									if (value && typeof value !== "string") {
										body[k] = JSON.stringify(value);
									}
									break;
								case "json":
									if (typeof value !== "object") {
										try {
											value = body[k] = JSON.parse(value);
										} catch (error) {
											return `${name}类型必须是json`;
										}
									}
									break;
								case "file":
									if (value.constructor.name != "File") {
										return `${name}类型必须是file`;
									}
									break;
								case "number":
									if (typeof value !== typ) return `${name}类型必须是${typ}`;
							}
						}
						if (len && value != null) {
							if (value.length < len[0]) {
								return `${name}长度需大于${len[0]}`;
							}
							if (len[1] > 0 && value.length > len[1]) {
								return `${name}长度需小于${len[1]}`;
							}
						}
						if (range && value != null) {
							if (value < range[0]) {
								return `${name}需大于${range[0]}`;
							}
							if (typeof range[1] === "number" && value > range[1]) {
								return `${name}需小于${range[1]}`;
							}
						}
						if (reg && !reg.test(value)) {
							return `${name}格式不正确`;
						}
						if (enu && enu.indexOf(body[k]) < 0) {
							return `${name}的值不能为${value}`;
						}
						if (opts && (value < 0 || value > opts.length)) {
							return `${name}的值不在[0,${opts.length}]中`;
						}
					}
					// 以上与 green.ts 同步
					if (rules) return rules(v, body);
					return true;
				}]
				list.push({
					props: Object.assign({ items, type }, props),
					on,
					key: k,
					view: view || typeView[typ] || 'v-text-field',
				});
			}
			return list;
		}
	},
	methods: {
		submit() {
			if (!this.$refs.form.validate()) return;
			this.open = false;
			this.$emit('submit', this.body)
		},
		cancel() {
			this.open = false;
			this.$emit('cancel', this.body)
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>