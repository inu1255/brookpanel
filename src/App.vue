<template>
	<v-app>
		<v-app-bar v-if="!meta.full" app flat absolute style="background: #fafafa;">
			<v-app-bar-nav-icon class="d-inline-flex d-sm-none" @click="drawer=true"></v-app-bar-nav-icon>
			<v-btn text to="/">
				<v-toolbar-title>{{$config.name}}</v-toolbar-title>
			</v-btn>
			<v-spacer />
			<v-btn icon>
				<v-icon color="tertiary">mdi-view-dashboard</v-icon>
			</v-btn>
			<v-btn icon>
				<v-icon color="tertiary">mdi-bell</v-icon>
			</v-btn>
			<v-menu v-if="$user.online">
				<template v-slot:activator="{on}">
					<v-btn icon v-on="on">
						<v-icon color="tertiary">mdi-account</v-icon>
					</v-btn>
				</template>
				<v-list>
					<v-list-item to="/setting">
						<v-list-item-title>设置</v-list-item-title>
					</v-list-item>
					<v-list-item @click="$user.logout(true)">
						<v-list-item-title>注销</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</v-app-bar>
		<v-navigation-drawer v-if="!meta.full" v-model="drawer" app dark floating persistent mobile-break-point="991" width="260">
			<v-img src="/images/sidebar.jpg" height="100%">
				<v-list shaped class="fill-height elevation-6">
					<v-list-item>
						<v-list-item-avatar color="white">
							<v-img :src="$user.info&&$user.info.avatar||'/favicon.ico'" height="34" contain />
						</v-list-item-avatar>
						<v-list-item-title class="title">{{$user.info&&$user.info.name}}</v-list-item-title>
					</v-list-item>
					<v-divider />
					<br>
					<v-list-item v-for="(link, i) in root" :key="i" :to="link.path" class="v-list-item">
						<v-list-item-icon>
							<v-icon>{{ link.icon }}</v-icon>
						</v-list-item-icon>
						<v-list-item-content>
							<v-list-item-title v-text="link.name" />
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</v-img>
		</v-navigation-drawer>
		<v-content>
			<div id="core-view">
				<v-fade-transition mode="out-in">
					<keep-alive>
						<router-view />
					</keep-alive>
				</v-fade-transition>
			</div>
		</v-content>
		<i-modal :open="$root.loading" padding="36px">
			<i-icon name="loading" loading size="36px" color="white" />
		</i-modal>
		<v-fab-transition>
			<v-btn v-show="scrollbar" color="pink" fab dark small fixed bottom right @click="$vuetify.goTo(0)">
				<v-icon>mdi-chevron-up</v-icon>
			</v-btn>
		</v-fab-transition>
	</v-app>
</template>
<script>
import { root } from './router';
import { ua } from './common/utils';
export default {
	data: function () {
		return {
			drawer: !ua.ismb,
			scrollbar: window.scrollY > 200,
		}
	},
	computed: {
		meta() {
			if (this.$route.matched.length) return this.$route.meta;
			return { full: true }
		},
		root() {
			return root.filter(x => x.name && (!x.meta.login || this.$user.online) && (!x.meta.lvl || this.$user.info && this.$user.info.lvl < x.meta.lvl)).map((item, i) => {
				item.path = item.path.replace(/\/:\w+/, '')
				return item;
			})
		}
	},
	mounted() {
		const onscroll = () => {
			this.scrollbar = window.scrollY > 200
		}
		window.addEventListener('scroll', onscroll)
		this.$once('hook:beforeDestroy', () => window.removeEventListener('scroll', onscroll))
	}
}
</script>
<style lang="less">
.msg-dialog {
	min-width: 20rem;
	background: #fff;
	padding: 1rem;
	border-radius: 0.2rem;
	font-size: 0.85rem;
	h3 {
		margin: 0;
		margin-bottom: 1em;
	}
}
.v-navigation-drawer {
	.v-list {
		background: rgba(27, 27, 27, 0.74);
		border-radius: 0;
	}
}
</style>