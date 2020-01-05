<template>
	<i-modal background="#fff" padding="24px" :open="open" persistent>
		<slot :body="body"></slot>
		<div class="tar">
			<i-button class="o-gray" @click="failure()">取消</i-button>
			<i-button class="blue" @click="success()">确定</i-button>
		</div>
	</i-modal>
</template>
<script>
import IModal from './IModal';
import IButton from './IButton';
export default {
	name: "IForm",
	props: {
		toast: Boolean, // 是否toast error
	},
	data() {
		return {
			open: false,
			body: {},
			loading: false,
		}
	},
	computed: {

	},
	methods: {
		edit(body, callback) {
			return new Promise((resolve, reject) => {
				this.body = body
				this.callback = callback
				this.resolve = resolve
				this.reject = reject
				this.open = true;
			});
		},
		failure() {
			this.open = false
			this.reject(this.body)
		},
		success() {
			if (this.callback) {
				if (this.loading) return
				this.loading = true;
				Promise.resolve(this.callback(this.body)).then((x) => {
					this.open = false
					this.loading = false;
					this.resolve(x)
				}, (e) => {
					this.loading = false;
					console.error(e)
					if (this.toast) this.$toast.error(e)
				})
			} else {
				this.open = false
				this.resolve(this.body)
			}
		},
	},
	mounted() {

	},
	components: {
		IModal,
		IButton,
	},
}
</script>