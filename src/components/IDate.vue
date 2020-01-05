<template>
	<span :title="tip" class="i-date" :class="cls">{{val}}</span>
</template>
<script>
import * as utils from '../common/utils'

export default {
	name: "IDate",
	props: {
		color: { type: Boolean }, // 显示过期颜色
		digits: { type: Number, default: 0 }, // 
		format: { type: String },
		value: {},
		def: { type: String, default: '' },
		freq: { type: Number, default: 5e3 },
	},
	data: function () {
		return {
			tick: 0,
		}
	},
	computed: {
		cls: function () {
			var cls = {};
			if (this.color) {
				if (new Date().getTime() > this.value) cls.red = true;
				else cls.green = true;
			}
			return cls;
		},
		tip: function () {
			if (this.value) {
				if (this.format)
					return this.fromNow(this.value, this.digits);
				else
					return utils.format(this.format || 'YYYY-MM-DD hh:mm', this.value);
			}
			return '';
		},
		val: function () {
			if (this.value) {
				if (this.format)
					return utils.format(this.format || 'YYYY-MM-DD hh:mm', this.value);
				else
					return this.fromNow(this.value, this.digits);
			}
			return this.def;
		}
	},
	methods: {
		diff: function (v, digits, suffix) {
			suffix = suffix || '';
			var s = '';
			var ts = [
				[86400e3 * 365, "年"],
				[86400e3 * 30, "月"],
				[86400e3, "天"],
				[3600e3, "小时"],
				[60e3, "分钟"],
				[1e3, "秒"],
			];
			for (var i = 0; i < ts.length; i++) {
				var unit = ts[i];
				var diff = v / unit[0];
				var tmp = Math.floor(diff);
				if (tmp) {
					if (digits) {
						var n = Math.pow(10, digits);
						s = Math.floor(v / unit[0] * n) / n;
					} else {
						s = tmp;
					}
					s += unit[1];
					break;
				}
			}
			if (s) return s + suffix;
		},
		fromNow: function (v, digits, def) {
			this.tick;
			digits = digits || 0;
			if (!v) return def || '未设置';
			if (typeof v === "number" && v < 1e12) {
				v *= 1e3;
			}
			v = +new Date(v)
			var suffix = ''
			if (v > 86400e3 * 365) {
				v -= Date.now();
				suffix = v > 0 ? '后' : '前'
			}
			var s = this.diff(Math.abs(v), digits, suffix);
			if (s) return s;
			return '刚刚';
		},
	},
	mounted() {
		if (!this.format) {
			var handle = setInterval(() => {
				this.tick++;
			}, this.freq);
			this.$once('beforeDestroy', function () {
				clearInterval(handle)
			});
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-date {
	white-space: nowrap;
	&.red {
		color: red;
	}
	&.green {
		color: green;
	}
}
</style>