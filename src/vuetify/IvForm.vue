<template>
	<v-dialog class="vuetify-iv-form" :value="value" @input="$emit('input',$event)" :width="width" persistent>
		<v-card>
			<v-card-title>{{title}}</v-card-title>
			<v-card-text>
				<v-form ref="form" v-model="valid" lazy-validation>
					<slot></slot>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn :color="cancelColor" text @click="$emit('input',false)">{{cancelText}}</v-btn>
				<v-btn :color="okColor" text @click="submit">{{okText}}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
export default {
	name: "IvForm",
	props: {
		value: {},
		width: {},
		title: String,
		okColor: { type: String, default: 'success' },
		okText: { type: String, default: '确定' },
		cancelColor: { type: String, default: 'grey' },
		cancelText: { type: String, default: '取消' },
	},
	data() {
		return {
			valid: false,
		}
	},
	computed: {

	},
	methods: {
		submit() {
			if (!this.$refs.form.validate()) return;
			this.$emit('submit')
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
.vuetify-iv-form {
}
</style>
