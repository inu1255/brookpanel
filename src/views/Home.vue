<template>
	<v-container class="pages-ssrs">
		<v-data-table v-if="show" class="elevation-1" :items="data.list" :headers="headers" :loading="data.loading" hide-default-footer disable-pagination>
			<template v-slot:top>
				<v-toolbar flat color="white">
					<v-toolbar-title>{{data.total}}个用户</v-toolbar-title>
					<a class="ml-4" href="/布谷鸟.app.zip" target="_blank">Mac端</a>
					<a class="ml-4" href="/布谷鸟.exe.zip" target="_blank">Windows端</a>
					<v-spacer></v-spacer>
					<v-btn @click="edit()" color="success" class="ml-2">添加</v-btn>
					<v-btn @click="data.search()" color="primary" class="ml-2">刷新</v-btn>
				</v-toolbar>
			</template>
			<template v-slot:item.port="{item}">
				{{["未启动","域名错误"][item.start_at]||(item.domain.length>1?"80;443":item.port)}}
			</template>
			<template v-slot:item.domain="{item}">
				{{getMode(item)}}
			</template>
			<template v-slot:item.used="{item}">
				{{item.u+item.d|traffic}}
			</template>
			<template v-slot:item.limit="{item}">
				{{item.limit|traffic}}
			</template>
			<template v-slot:item.speed="{item}">
				{{item.speed|traffic}}
			</template>
			<template v-slot:item.update_at="{item}">
				<i-date :value="item.update_at"></i-date>
			</template>
			<template v-slot:item.expire_at="{item}">
				<i-date :value="item.expire_at"></i-date>
			</template>
			<template v-slot:item.enable="{item}">
				{{item.enable?'是':'否'}}
			</template>
			<template v-slot:item.tools="{item}">
				<v-btn text color="success" @click="view(item)">查看</v-btn>
				<v-btn text color="primary" @click="edit(item)">修改</v-btn>
				<v-btn text color="error" @click="del(item)">删除</v-btn>
			</template>
		</v-data-table>
		<i-form ref="form">
			<template v-slot="{body}">
				<v-text-field label="备注" v-model="body.mark"></v-text-field>
				<v-select label="模式" :items="modes" :value="body.domain&&body.domain[0]" @change="body.domain=$event"></v-select>
				<!-- <v-text-field v-show="body.domain[0]=='w'" label="域名(不填则仅开启http)" :value="body.domain.slice(1)" @change="body.domain='w'+$event"></v-text-field> -->
				<v-flex v-show="!body.domain||body.domain.length<2" align-end>
					<v-text-field label="端口" v-model="body.port" type="number"></v-text-field>
					<v-btn text tile @click="body.port=$utils.randN(1e4)+1e4">随机</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="密码" v-model="body.passwd"></v-text-field>
					<v-btn text tile @click="body.passwd=$utils.randomString(6)">随机</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="上行流量(Mb)" :value="(body.u/1024/1024).toFixed(2)" @change="body.u=$event*1024*1024" type="number"></v-text-field>
					<v-btn text tile @click="body.u=0">清空</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="下行流量(Mb)" :value="(body.d/1024/1024).toFixed(2)" @change="body.d=$event*1024*1024" type="number"></v-text-field>
					<v-btn text tile @click="body.d=0">清空</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="总流量(Gb)" :value="(body.limit/1024/1024/1024).toFixed(2)" @change="body.limit=$event*1024*1024*1024" type="number"></v-text-field>
					<v-btn text tile @click="body.limit=2048*1024*1024">试用</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="限速(Mb)" :value="(body.speed/1024/1024).toFixed(2)" @change="body.speed=$event*1024*1024" type="number"></v-text-field>
					<v-btn text tile @click="body.speed=0">不限</v-btn>
				</v-flex>
				<v-flex align-end>
					<v-text-field label="查看链接" v-model="body.token"></v-text-field>
					<v-btn text tile @click="body.token=$utils.randomString(32)">随机</v-btn>
				</v-flex>
				<iv-date lable="过期时间" v-model="body.expire_at"></iv-date>
				<v-checkbox label="是否启用" v-model="body.enable"></v-checkbox>
			</template>
		</i-form>
	</v-container>
</template>
<script>
import Vue from 'vue'

export default {
	data: function () {
		return {
			data: new utils.DataSource(this.query),
			modes: [{
				text: 'brook',
				value: '',
			}, {
				text: 'Shadowsocks',
				value: 's',
			}, {
				text: 'WSServer',
				value: 'w',
			},],
			show: false,
		}
	},
	computed: {
		headers() {
			let list = [{
				text: '备注',
				value: 'mark',
			}, {
				text: '端口',
				value: 'port',
				sortable: true,
			}, {
				text: '模式',
				value: 'domain',
			}, {
				text: '已使用',
				value: 'used',
				sortable: true,
			}, {
				text: '总流量',
				value: 'limit',
				sortable: true,
			}, {
				text: '网速',
				value: 'speed',
				sortable: true,
			}, {
				text: '在线',
				value: 'update_at',
				sortable: true,
			}, {
				text: '过期',
				value: 'expire_at',
				sortable: true,
			}, {
				text: '启用',
				value: 'enable',
			}, {
				text: '操作',
				value: 'tools',
			}]
			return list
		},
	},
	methods: {
		view(row) {
			window.open('/view?key=' + btoa(`${row.id}:${row.token}`))
		},
		edit(item) {
			item = item || {
				port: utils.randN(1e4) + 2e4,
				passwd: utils.randomString(6),
				token: utils.randomString(32),
				domain: '',
				u: 0,
				d: 0,
				limit: 2048 * 1024 * 1024,
				speed: 2048 * 1024,
				expire_at: Date.now() + 3 * 86400e3,
				enable: 1,
			}
			this.$refs.form.edit(Object.assign({}, item), async (body) => {
				body.expire_at += 86399e3
				for (let k in body) {
					let v = body[k]
					if (typeof v === "number")
						body[k] = Math.floor(v)
				}
				if (!body.id)
					await this.$post('users/add', body)
				else
					await this.$post('users/set', body)
				this.data.search()
			})
		},
		async del(row) {
			await this.$msg.confirm('是否删除')
			await this.$get('users/del', { id: row.id })
			this.data.search()
		},
		getMode(item) {
			if (item.domain[0] == 'w')
				return 'ws'
			if (item.domain[0] == 's')
				return 'ss'
			return 'brook'
		},
		query(body) {
			return this.$get('users/list', body)
		},
		async refresh() {
			await this.data.search(0)
			this.show = true
		},
	},
	mounted() {
		this.refresh()
	}
}
</script>