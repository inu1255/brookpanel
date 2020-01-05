<template>
	<i class="iconfont" @click="$emit('click',$event)" :class="cls" :style="style"></i>
</template>
<script>
export default {
	props: {
		value: String,
		name: String,
		size: [Number, String],
		rotate: Number,
		loading: Boolean,
		color: String,
	},
	computed: {
		style() {
			let style = {}
			if (this.size) style.fontSize = /\d$/.test(this.size) ? this.size + 'px' : this.size
			if (this.rotate) style.transform = `rotate(${this.rotate}deg)`
			if (this.color) style.color = this.color;
			return style
		},
		cls() {
			let cls = {}
			if (/-| /.test(this.name)) {
				this.name.trim().split(/\s+/).forEach(item => cls[item] = true)
			}
			else cls['icon-' + (this.name || this.value)] = true
			if (this.loading) cls.loading = true
			if (this.$listeners.click) cls.btn = true;
			return cls
		}
	}
}
</script>
<style lang="less">
@import "~@/styles/define.less";
i.iconfont {
	transition: transform 0.5s;
	font-size: inherit;
	&.loading {
		.loading;
	}
}
</style>

