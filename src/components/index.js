import IModal from './IModal';
import IRate from './IRate';
import IDate from './IDate';
import ISpan from './ISpan';
import IIcon from './IIcon';
import IPage from './IPage';
import IForm from './IForm';
import IButton from './IButton';

const components = {
	IModal,
	IRate,
	IDate,
	ISpan,
	IIcon,
	IPage,
	IForm,
	IButton,
};
const install = function(Vue, opts = {}) {
	for (let k in components) {
		let v = components[k];
		Vue.component(k, v);
	}
};

//  可以根据实际情况，是否需要这段代码（CDN引入，便可使用所有组件）
if (window && window.Vue) install(window.Vue);
//  3、导出类库的版本、组件、Vue插件需要暴露的install方法
export default {
	version: '0.0.1',
	install,
};