<template>
	<transition name="it-fade">
		<div class="i-modal" :class="{'v-menu__content--active':open}" v-if="open">
			<div class="i-modal-mask" @click="persistent||$emit('update:open',false)"></div>
			<div class="i-modal-wrapper" :style="{background,padding}">
				<slot></slot>
			</div>
		</div>
	</transition>
</template>
<script>
import { pushIndex } from './zindex';
export default {
	props: {
		open: {},
		autofocus: Boolean,
		padding: String,
		background: String,
		persistent: Boolean,
	},
	watch: {
		open: {
			immediate: true,
			handler() {
				if (this.open) {
					this.$nextTick(() => {
						pushIndex(this.$el)
						if (this.autofocus) {
							var input = this.$el.querySelector('input')
							input && input.focus();
						}
					})
				}
			}
		}
	}
}
</script>
<style lang="less">
.i-modal.v-menu__content--active {
	pointer-events: auto;
}
.i-modal {
	width: 100vw;
	height: 100vh;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	position: fixed;
	z-index: 200;
	overflow: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(127, 127, 127, 0.5);
}
.i-modal-mask {
	background-color: transparent;
	z-index: 10;
	opacity: 0;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;
}
.i-modal-wrapper {
	position: relative;
	z-index: 100;
	width: auto;
	display: flex;
	flex-direction: column;
	overflow: auto;
	max-width: 100%;
	max-height: 100%;
}
</style>