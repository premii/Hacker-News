/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-hourglass' : '&#xe000;',
			'icon-bubble' : '&#xe001;',
			'icon-export' : '&#xe002;',
			'icon-refresh' : '&#xe003;',
			'icon-settings' : '&#xe004;',
			'icon-user' : '&#xe005;',
			'icon-ellipsis' : '&#xe006;',
			'icon-refresh-2' : '&#xe018;',
			'icon-user-2' : '&#xe007;',
			'icon-cross' : '&#xe008;',
			'icon-arrow-left' : '&#xe00a;',
			'icon-newspaper' : '&#xe009;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};