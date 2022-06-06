function myPlugin(options, isMobil) {
	var $doc = window.document
	var defaults = {
		parentdraf: '.J-xloginPanel', // 拖拽元素父级
		draftin: '.J-xloginPanel h3', // 拖拽元素
		// sizeLeft: '.J-xloginPanel .barl', // 改变大小左边
		// sizeRight: '.J-xloginPanel .barr', // 改变大小右边
		// sizeTop: '.J-xloginPanel .bart', // 改变大小上边
		// sizeBottom: '.J-xloginPanel .barb',  // 改变大小下边
		// sizeSkew: '.J-xloginPanel .bar'
	};
	var settings = Object.assign({}, defaults, options);

	function bindEvent(el, type, func) {
		if (el.addEventListener) {
			el.addEventListener(type, func, false)
		} else if (el.attachEvent) {
			el.attachEvent('on' + type, func)
		} else {
			el['on' + type] = func
		}
	}

	function removeEvent(el, type, func) {
		if (el.removeEventListener) {
			el.removeEventListener(type, func)
		} else if (el.detachEvent) {
			el.detachEvent('on' + type, func)
		} else {
			el['on' + type] = null
		}
	}

	function getClsDom(name) {
		return window.document.getElementsByClassName(name)[0]
	}

	/* 拖拽 */
	bindEvent(getClsDom(settings.draftin), 'mousedown', dragmove)
	// 移动端
	if(isMobil){
		bindEvent(getClsDom(settings.draftin), 'touchstart', dragmoveMobil)
	}
	function dragmove(event) {
		event = event || window.event;
		var disX = event.pageX - getClsDom(settings.parentdraf).offsetLeft;
		var disY = event.pageY - getClsDom(settings.parentdraf).offsetTop;
		bindEvent($doc, 'mousemove', move)
		bindEvent($doc, 'mouseup', function() {
			removeEvent($doc, 'mousemove', move)
		})
		function move(event) {
			event.stopPropagation();
			event = event || window.event;
			var mouseX = event.pageX - disX;
			var mouseY = event.pageY - disY;
			var maxX = document.documentElement.clientWidth - getClsDom(settings.parentdraf).clientWidth,
				maxY = document.documentElement.clientHeight - getClsDom(settings.parentdraf).clientHeight;
			if (mouseX < 0) {
				mouseX = 0;
			} else if (mouseX > maxX) {
				mouseX = maxX;
			}
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > maxY) {
				mouseY = maxY;
			}
			var parentdraf = getClsDom(settings.parentdraf)
			parentdraf.style.left = mouseX + 'px'
			parentdraf.style.top = mouseY + 'px'
			parentdraf.style.marginLeft = 0;
			parentdraf.style.marginTop = 0;
			parentdraf.style.position = 'fixed';
		};
	};
	function dragmoveMobil(event) {
		var parentdraf = getClsDom(settings.parentdraf)
		event = event || window.event;
		event = event.originalEvent.targetTouches && event.originalEvent.targetTouches[0];
		var disX = (event && event.pageX) - parentdraf.offsetLeft;
		var disY = (event && event.pageY) - parentdraf.offsetTop;
		bindEvent($doc, 'touchmove', move)
		bindEvent($doc, 'touchend', function() {
			removeEvent($doc, 'mousemove', move)
		})
		function move(event) {
			event.stopPropagation();
			event = event || window.event;
			event = event.originalEvent && event.originalEvent.targetTouches[0];
			var mouseX = event.pageX - disX;
			var mouseY = event.pageY - disY;
			var maxX = document.documentElement.clientWidth - parentdraf.clientWidth,
				maxY = document.documentElement.clientHeight - parentdraf.clientHeight;
			if (mouseX < 0) {
				mouseX = 0;
			} else if (mouseX > maxX) {
				mouseX = maxX;
			}
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > maxY) {
				mouseY = maxY;
			}
			parentdraf.style.left = mouseX + 'px'
			parentdraf.style.top = mouseY + 'px'
			parentdraf.style.marginLeft = 0;
			parentdraf.style.marginTop = 0;
			parentdraf.style.position = 'fixed';
		};
	};

	/* 左边 */
	settings.sizeLeft && bindEvent(getClsDom(settings.sizeLeft), 'mousedown', function (event) {
		event = event || window.event;
		var parentdraf = getClsDom(settings.parentdraf)
		var disX = parentdraf.offsetLeft,
			drafw = parentdraf.clientWidth;
		bindEvent($doc, 'mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX;
			if (mouseX < 0) mouseX = 0;
			parentdraf.style.left = mouseX + 'px'
			parentdraf.style.width = (disX - mouseX - 4) + drafw + 'px';
			parentdraf.style.marginLeft = 0;
			parentdraf.style.position = 'fixed';
		})
	})

	/* 右边 */
	settings.sizeRight && bindEvent(getClsDom(settings.sizeRight), 'mousedown', function (event) {
		event = event || window.event;
		var parentdraf = getClsDom(settings.parentdraf)
		var disX = parentdraf.offsetLeft;
		var disW = parentdraf.clientWidth
		bindEvent($doc, 'mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX - disX,
				maxX = document.documentElement.clientWidth - disX - 2;
			if (mouseX > maxX) mouseX = maxX;
			if (mouseX < disW) mouseX = disW;
			parentdraf.style.width = mouseX + 'px';
		})
	})

	/* 上边 */
	settings.sizeTop && bindEvent(getClsDom(settings.sizeTop), 'mousedown', function (event) {
		event = event || window.event;
		var parentdraf = getClsDom(settings.parentdraf)
		var disY = parentdraf.offsetTop,
			drafH = parentdraf.clientHeight;
		bindEvent($doc, 'mousemove', function (event) {
			event = event || window.event;
			var mouseY = event.pageY,
				range = disY - mouseY - 4;
			if (mouseY + 4 > 0) {
				parentdraf.style.top = mouseY + 'px';
				parentdraf.style.height = range + drafH + 'px'
				parentdraf.style.marginTop = 0
			};
		})
	})

	/* 下边 */
	settings.sizeBottom && bindEvent(getClsDom(settings.sizeBottom), 'mousedown', function (event) {
		event = event || window.event;
		var parentdraf = getClsDom(settings.parentdraf)
		var disY = parentdraf.offsetTop;
		var disH = parentdraf.clientHeight;
		bindEvent($doc, 'mousemove', function (event) {
			event = event || window.event;
			var mouseY = event.pageY - disY,
				maxY = document.documentElement.clientHeight - disY - 2;
			if (mouseY > maxY) mouseY = maxY;
			if (mouseY < disH) mouseY = disH;
			parentdraf.style.height = mouseY + 'px'
		})
	})


	/* 下斜 */
	settings.sizeSkew && bindEvent(getClsDom(settings.sizeSkew), 'mousedown', function (event) {
		event = event || window.event;
		var parentdraf = getClsDom(settings.parentdraf)
		var 
			disX = parentdraf.offsetLeft,
			disY = parentdraf.offsetTop;
		var disH = parentdraf.clientHeight;
		var disW = parentdraf.clientWidth;
		bindEvent($doc, 'mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX - disX + 14,
				mouseY = event.pageY - disY + 14,
				maxX = document.documentElement.clientWidth - disX - 2,
				maxY = document.documentElement.clientHeight - disY - 2;
			if (mouseX > maxX) mouseX = maxX;
			if (mouseY > maxY) mouseY = maxY;
			if (mouseX < disW) mouseX = disW;
			if (mouseY < disH) mouseY = disH;
			parentdraf.style.width = mouseX + 'px'
			parentdraf.style.height = mouseY + 'px'
		})
	})

	/* 松开鼠标 */
	bindEvent($doc, 'mouseup', function () {
		removeEvent($doc, 'mousedown', dragmove)
		removeEvent($doc, 'mousemove', dragmove)
		removeEvent($doc, 'touchstart', dragmoveMobil)
		removeEvent($doc, 'touchmove', dragmoveMobil)
	})
};
function offDarg(el){
	if(el){
		removeEvent(el, 'mousedown', null)
		removeEvent(el, 'mousemove', null)
		removeEvent(el, 'touchstart', null)
		removeEvent(el, 'touchmove', null)
	}
}

export default {
	drag: myPlugin,
	offDarg:offDarg
};
