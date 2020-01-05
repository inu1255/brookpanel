<template>
	<span class="i-span" :title="title" @click="onclick">
		<slot></slot>
	</span>
</template>
<script>
export default {
	name: "ISpan",
	props: {
		title: String,
		select: Boolean,
		copy: Boolean,
	},
	data() {
		return {

		}
	},
	computed: {

	},
	methods: {
		onclick(e) {
			if (this.copy) {
				if (utils.copy(this.$el.innerText))
					this.$toast.success((this.title || '') + '已复制')
				else
					utils.selectNode(this.$el)
			} else if (this.select)
				utils.selectNode(this.$el)
			this.$emit('click', e);
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-span {
}
</style>
