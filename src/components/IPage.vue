<script>
export default {
	name: "IPage",
	props: {
		total: { type: Number, required: true }, // 总共多少条数据
		value: { type: Number, default: 0 }, // 当前页码
		pageSize: { type: Number, default: 10 }, // 每页多少条数据
		pageCnt: { type: Number, default: 7 } // 最多显示多少个数字(包含…)
	},
	computed: {
		min() { // 最小页码
			return 0;
		},
		max() { // 最大页码
			return Math.floor((this.total - 1) / this.pageSize);
		}
	},
	render(h) {
		var that = this;
		var children = [];
		var page = this.value;
		var onClick = function (e) {
			var v = e.target.innerText;
			if (v.startsWith('上')) v = that.value - 1;
			else if (v.startsWith('下')) v = that.value + 1;
			else v = parseInt(v) - 1;
			that.$emit('input', v);
		};
		var opt = { on: { click: onClick } };
		children.push(h('a', Object.assign({ class: 'active' }, opt), page + 1));
		var b = page - 1;
		var e = page + 1;
		var n = Math.min(this.pageCnt - 2, this.max);
		var m = 10000;
		while (children.length < n && m--) {
			if (b >= this.min) children.unshift(h('a', opt, b-- + 1));
			if (children.length >= n) break;
			if (e <= this.max) children.push(h('a', opt, e++ + 1));
		}
		if (!m) console.log('error');
		if (b == this.min) children.unshift(h('a', opt, b + 1));
		else if (b > this.min) {
			children.unshift(h('span', null, '…'));
			children.unshift(h('a', opt, this.min + 1));
		}
		if (e == this.max) children.push(h('a', opt, e + 1));
		else if (e < this.max) {
			children.push(h('span', null, '…'));
			children.push(h('a', opt, this.max + 1));
		}
		if (page > this.min) children.unshift(h('a', opt, '上一页'));
		if (page < this.max) children.push(h('a', opt, '下一页'));
		if (this.max > 5) {
			var JumpTo = function (e) {
				var jumpPg = e.target.value.trim();
				if (!jumpPg) return;
				setTimeout(function () { e.target.value = ''; }, 500);
				if (!(/^[0-9]+$/.test(jumpPg))) return that.$toast.error('您输入的页码格式有错误');
				jumpPg = parseInt(jumpPg - 1, 10);
				if (jumpPg < that.min || jumpPg > that.max) return that.$toast.error('您输入的页码超出范围');
				if (jumpPg == page) return that.$toast.error('当前页码：' + (jumpPg + 1));
				that.$emit('input', jumpPg);
			};
			children.push(h('span', { attrs: { title: page * this.pageSize + '/' + this.total } }, ['跳转到', h('input', { props: { value: '' }, attrs: { value: '' }, class: 'jumpPg', on: { change: JumpTo } }), '页']));
		}
		return h('div', { class: 'i-page' }, children);
	}
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-page {
	text-align: center;
	font-size: 0.7rem;
	> a {
		display: inline-block;
		cursor: pointer;
		padding: 0.5em;
		line-height: 1;
		background: #f1eff0;
		margin: 0 0.25em;
		&.active {
			background: @blue;
			color: #fff;
		}
	}
	input.jumpPg {
		width: 3rem;
		outline: none;
		border: none;
		border-bottom: 1px solid #555;
		text-align: center;
	}
}
</style>
