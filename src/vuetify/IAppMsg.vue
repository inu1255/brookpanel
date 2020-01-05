<template>
	<v-dialog v-model="open" :width="width" persistent>
		<v-card>
			<v-card-title>{{title}}</v-card-title>
			<v-card-text>
				<i-span copy>{{text}}</i-span>
				<v-text-field v-if="input" v-model.lazy="v" autofocus></v-text-field>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text color="grey" v-if="failureText" @click="close('failure')">{{failureText}}</v-btn>
				<v-btn text color="primary" v-if="successText" @click="close('success')">{{successText}}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
import ISpan from '../components/ISpan';

export default {
	name: "IAppMsg",
	props: {
		width: Number,
		failureText: String,
		successText: String,
		title: String,
		text: String,
		input: Boolean,
		value: {},
	},
	data: function () {
		return {
			open: true,
			v: '',
		}
	},
	watch: {
		value: {
			immediate: true,
			handler() {
				this.v = (this.value || '') + '';
			}
		}
	},
	computed: {
	},
	methods: {
		close(e) {
			this.open = false;
			this.$emit(e, this.v)
		}
	},
	mounted() {

	},
	components: {
		ISpan,
	},
}
</script>