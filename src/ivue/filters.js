import Vue from 'vue';

const bs = ["b", "Kb", "Mb", "Gb"];
export function traffic(v, i, n) {
	v = parseInt(v);
	n = n || 0;
	for (i = i || 0; i < 4; i++) {
		if (v < 1024) {
			return v + bs[i];
		}
		v = (v / 1024).toFixed(n);
	}
	return v + "GB";
}
Vue.filter('traffic', traffic);