<template>
	<button class="i-button" :class="{active,click}" @click="$emit('click',$event)" :style="style" @mousedown="click=1" @mouseup="click=0" @mouseenter="hover=1" @mouseleave="click=hover=0">
		<slot></slot>
	</button>
</template>
<script>
import { Color } from '../common/utils';
export default {
	name: "IButton",
	props: {
		color: String,
		bg: String,
		active: Boolean,
		activeColor: String,
		activeBg: String,
		border: Boolean,
	},
	data() {
		return {
			hover: 0,
			click: 0,
		}
	},
	computed: {
		style() {
			var s = {}
			var color = this.activeColor && this.active ? this.activeColor : this.color
			if (color) {
				if (this.hover) s.color = new Color(color).hover('#191919').toString()
				else s.color = color;
			}
			var bgColor = this.activeBg && this.active ? this.activeBg : this.bg;
			if (bgColor) {
				var bg = new Color(bgColor);
				if (this.hover) s.backgroundColor = bg.hover('#191919').toString()
				else s.backgroundColor = bg.toString();
				if (!s.color && bg.brightness() > 0.8)
					s.color = "#000"
				else
					s.color = "#fff"
			}
			if (this.border) {
				if (s.backgroundColor)
					s.border = `1px solid ${s.backgroundColor}`
				else if (this.active)
					s.border = `1px solid ${s.color}`
				else
					s.border = `1px solid #d5d5d5`;
			}
			return s;
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
.i-button {
	&.green {
		.magic-background(@green);
	}
	&.blue {
		.magic-background(@blue);
	}
	&.gray {
		.magic-background(@gray);
	}
	&.o-gray {
		.magic-color(#333, #ccc);
	}
	+ .i-button {
		margin-left: 0.5rem;
	}
	padding: 0 5px;
}
</style>
