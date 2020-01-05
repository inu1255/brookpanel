var index = 1255;
/**
 * @param {HTMLElement} el 
 */
export function pushIndex(el) {
	return el.style.zIndex = index++;
}