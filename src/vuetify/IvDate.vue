<template>
	<v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="290px">
		<template v-slot:activator="{ on }">
			<v-text-field :value="dateFormat" :label="label" :prepend-icon="prependIcon" readonly v-on="on"></v-text-field>
		</template>
		<v-date-picker :value="date" @input="change" color="green lighten-1" show-current no-title scrollable></v-date-picker>
	</v-menu>
</template>
<script>
export default {
	name: "IvDate",
	props: {
		value: {},
		label: String,
		prependIcon: String,
		format: { type: String, default: 'YYYY-MM-DD' }, // 日期格式,见 utils.format
	},
	data() {
		return {
			menu: false,
		}
	},
	computed: {
		dateFormat() {
			return utils.format(this.format, this.value)
		},
		date() {
			var date = this.value ? new Date(this.value) : new Date();
			return date.toISOString().substr(0, 10)
		}
	},
	methods: {
		change(v) {
			v = new Date(v)
			if (this.format === "YYYY-MM-DD") v = new Date(v.getFullYear(), v.getMonth(), v.getDate(), 0, 0, 0)
			this.$emit('input', v.getTime())
			this.menu = false;
		},
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.vuetify-iv-date {
}
</style>
