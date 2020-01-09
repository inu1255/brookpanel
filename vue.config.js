const prod = process.env.NODE_ENV == 'production';
module.exports = {
	outputDir: undefined,
	assetsDir: 'static',
	runtimeCompiler: undefined,
	productionSourceMap: !prod,
	parallel: undefined,
	css: undefined,
	devServer: {
		proxy: {
			'/api': {
				target: 'http://localhost:9182',
				ws: true,
				changeOrigin: true
			},
		}
	},
	configureWebpack: config => {
		config.externals = {
			'vue': 'Vue',
			'vue-router': 'VueRouter',
			'vuetify': 'Vuetify',
		};
	}
};