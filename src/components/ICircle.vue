<template>
	<div class="i-circle sized" :style="style">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "ICircle",
	props: {
		color: { type: String, default: '#fff' },
		size: { default: '1.5em' },
	},
	data() {
		return {

		}
	},
	computed: {
		style() {
			var s = { backgroundColor: this.color }
			var size = this.size
			if (size) s.width = s.height = /\d$/.test(size) ? size + 'px' : size;
			console.log(/\d$/.test(size) ? size + 'px' : size)
			return s
		}
	},
	methods: {

	},
	mounted() {
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-circle {
	border-radius: 50%;
}
</style>
