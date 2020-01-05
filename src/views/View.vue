<template>
	<v-container>
		<v-row>
			<v-col cols="12" md="4" xl="3">
				<v-card :z-depth="1">
					<v-card-title>
						<v-icon class="v-icon-fix" value="info"></v-icon>连接信息
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<div><b>服务器：</b>
							<i-span copy>{{ip}}</i-span>
						</div>
						<div><b>密码：</b>
							<i-span copy>{{ssr.passwd}}</i-span>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" md="4" xl="3">
				<v-card :z-depth="1">
					<v-card-title>
						<v-icon class="v-icon-fix" value="timer"></v-icon>过期时间
					</v-card-title>
					<v-divider></v-divider>
					<div class="content tac" style="font-size:36px;">
						<i-date :value="ssr.expire_at"></i-date><br>
						<i-date :value="ssr.expire_at" format="YYYY-MM-DD"></i-date><br>
					</div>
				</v-card>
			</v-col>
			<v-col cols="12" md="4" xl="3">
				<v-card :z-depth="1">
					<v-card-title>
						<v-icon class="v-icon-fix" value="graphic_eq"></v-icon>流量
					</v-card-title>
					<v-divider></v-divider>
					<div class="content tac" style="font-size:36px;">
						<i-rate :value="(ssr.u+ssr.d)/ssr.limit">{{ssr.u+ssr.d|traffic}}/{{ssr.limit|traffic}}</i-rate>
					</div>
					<v-divider></v-divider>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn @click="refresh" text color="primary">
							<v-icon small left>mdi-refresh</v-icon>刷新
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
			<v-col cols="12" md="4" xl="3">
				<v-card :z-depth="1">
					<v-card-title>
						<v-icon class="v-icon-fix" value="crop_free"></v-icon>二维码
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text class="text-center">
						<vue-qr :text="brook_qr"></vue-qr>
						<span class="break">{{brook_qr}}</span>
					</v-card-text>
					<v-divider></v-divider>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn @click="copy(brook_qr)" text color="primary">
							<v-icon small left>mdi-content-copy</v-icon>复制
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>
<script>
import Vue from 'vue'
import VueQr from 'vue-qr'

export default {
	data: function () {
		return {
			ssr: {},
		}
	},
	computed: {
		node() {
			for (let item of this.nodes) {
				item.label = item.name
				item.value = item.id
				if (item.id == this.ssr.node_id) {
					return item
				}
			}
			return {}
		},
		ip() {
			var ip = location.host.split(':')[0]
			if (/^w$/.test(this.ssr.domain))
				return 'ws://' + ip + ':' + this.ssr.port
			if (/^w\w+/.test(this.ssr.domain))
				return 'wss://' + this.ssr.domain.slice(1)
			return ip + ':' + this.ssr.port
		},
		brook_qr() {
			let { passwd } = this.ssr
			let ip = this.ip
			let text = `${ip} ${passwd}`
			return "brook://" + encodeURIComponent(text)
		},
		pa() {
			let key = atob(this.$route.query.key)
			let idx = key.indexOf(':')
			let id = key.slice(0, idx)
			let token = key.slice(idx + 1)
			return { id, token }
		},
	},
	methods: {
		copy(str) {
			utils.copy(str)
		},
		async refresh() {
			let { id, token } = this.pa
			let ssr = await this.$get('brook/getmyinfo', { id, token })
			this.ssr = ssr
		},
	},
	mounted() {
		this.refresh()
	}
}
</script>