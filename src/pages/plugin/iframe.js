var utils = require("./common/utils");
var _const = require("./common/const");
var Transfer = require("./common/transfer");
var loading = require("./loading");
var notify = require("./notify");
var titleSlide = require("./titleSlide");
var pcImgView = require("./pcImgview");
var InviteBox = require("./inviteView");
// var eventListener = require("@/app/tools/eventListener");

var IM_HTML_PATH = "/index.html";
var me = this;
var _st = 0;
var _startPosition = {
	x: 0,
	y: 0
};
var emptyFunc = function(){};
var inviteBox;
var isOpened = false;

function _move(ctx, ev){
	var e = window.event || ev;
	var _width = document.documentElement.clientWidth;
	var _height = document.documentElement.clientHeight;
	ctx.rect.width = parseInt(ctx.iframe.style.width.slice(0, -2));
	ctx.rect.height = parseInt(ctx.iframe.style.height.slice(0, -2));
	var _x = _width - e.clientX - ctx.rect.width + _startPosition.x;
	var _y = _height - e.clientY - ctx.rect.height + _startPosition.y;

	if(e.clientX - _startPosition.x <= 0){ // left
		_x = _width - ctx.rect.width;
	}
	else if(e.clientX + ctx.rect.width - _startPosition.x >= _width){ // right
		_x = 0;
	}
	if(e.clientY - _startPosition.y <= 0){ // top
		_y = _height - ctx.rect.height;
	}
	else if(e.clientY + ctx.rect.height - _startPosition.y >= _height){ // bottom
		_y = 0;
	}
	ctx.shadow.style.left = "auto";
	ctx.shadow.style.top = "auto";
	ctx.shadow.style.right = _x + "px";
	ctx.shadow.style.bottom = _y + "px";

	ctx.iframe.style.left = "auto";
	ctx.iframe.style.top = "auto";
	ctx.iframe.style.right = _x + "px";
	ctx.iframe.style.bottom = _y + "px";

	ctx.position = {
		x: _x,
		y: _y
	};

	clearTimeout(_st);
	_st = setTimeout(function(){
		_moveend.call(ctx);
	}, 500);
}

function _moveend(){
	var me = this;
	var iframe = me.iframe;
	var shadow = me.shadow;

	utils.off(document, "mousemove", me._onMouseMove);
	iframe.style.left = "auto";
	iframe.style.top = "auto";
	iframe.style.right = me.position.x + "px";
	iframe.style.bottom = me.position.y + "px";
	shadow.style.left = "auto";
	shadow.style.top = "auto";
	shadow.style.right = me.position.x + "px";
	shadow.style.bottom = me.position.y + "px";
	utils.removeClass(shadow, "easemobim-dragging");
	utils.removeClass(iframe, "easemobim-dragging");
}

function _bindResizeHandler(ctx){
	utils.on(window, "resize", function(){
		if(!ctx.rect || !ctx.rect.width){
			return;
		}

		var _width = document.documentElement.clientWidth;
		var _height = document.documentElement.clientHeight;
		var _right = +ctx.iframe.style.right.slice(0, -2);
		var _bottom = +ctx.iframe.style.bottom.slice(0, -2);

		// width
		if(_width < ctx.rect.width){
			ctx.iframe.style.left = "auto";
			ctx.iframe.style.right = 0;
			ctx.shadow.style.left = "auto";
			ctx.shadow.style.right = 0;
		}
		else if(_width - _right < ctx.rect.width){
			ctx.iframe.style.right = _width - ctx.rect.width + "px";
			ctx.iframe.style.left = 0;
			ctx.shadow.style.right = _width - ctx.rect.width + "px";
			ctx.shadow.style.left = 0;
		}
		else{
			ctx.iframe.style.left = "auto";
			ctx.shadow.style.left = "auto";
		}

		// height
		if(_height < ctx.rect.height){
			ctx.iframe.style.top = "auto";
			ctx.iframe.style.bottom = 0;
		}
		else if(_height - _bottom < ctx.rect.height){
			ctx.iframe.style.bottom = _height - ctx.rect.height + "px";
			ctx.iframe.style.top = 0;
		}
		else{
			ctx.iframe.style.top = "auto";
		}
	});
}

function _ready(){
	var me = this;
	var i, l;

	(me.config.dragenable && !utils.isMobile) && _bindResizeHandler(me);

	me.down2Im = new Transfer(me.iframe.id, "down2Im", true);

	me.onsessionclosedSt = 0;
	me.onreadySt = 0;
	me.config.parentId = me.iframe.id;

	// ???config???????????????clone?????????
	me.callbackApi = {
		onready: me.config.onready || emptyFunc,
		onmessage: me.config.onmessage || emptyFunc,
		onsessionclosed: me.config.onsessionclosed || emptyFunc,
		onclose: me.config.onclose || emptyFunc, //??????????????????????????????????????????????????????
		onopen: me.config.onopen || emptyFunc, //????????????????????????????????????
		onEvaluationsubmit: me.config.onEvaluationsubmit || emptyFunc,
		onsessioncreat: me.config.onsessioncreat || emptyFunc
	};
	delete me.config.onready;
	delete me.config.onmessage;
	delete me.config.onsessionclosed;
	delete me.config.onclose;
	delete me.config.onopen;
	delete me.config.onEvaluationsubmit;
	delete me.config.onsessioncreat;

	me.down2Im
	.send({ event: _const.EVENTS.INIT_CONFIG, data: me.config })
	.listen(function(msg){
		var event = msg.event;
		var data = msg.data;

		if(msg.to !== me.iframe.id){
			return;
		}

		switch(event){
		case _const.EVENTS.ONREADY:
			clearTimeout(me.onreadySt);
			loading.hide();
			me.onreadySt = setTimeout(function(){
				me.callbackApi.onready();
			}, 500);
			break;
		case _const.EVENTS.ON_OFFDUTY:
			loading.hide();
			break;
		case _const.EVENTS.SHOW:
			// ??????????????????
			me.open();
			break;
		case _const.EVENTS.CLOSE:
			// ?????????????????????
			loading.hide();
			me.close();
			me.callbackApi.onclose();
			break;
		case _const.EVENTS.NOTIFY:
			// ?????????????????????
			notify(data.avatar, data.title, data.brief);
			break;
		case _const.EVENTS.SLIDE:
			// ????????????
			titleSlide.start();
			break;
		case _const.EVENTS.RECOVERY:
			// ??????????????????
			titleSlide.stop();
			break;
		case _const.EVENTS.ONMESSAGE:
			// ???????????????
			me.callbackApi.onmessage(data);
			break;
		case _const.EVENTS.ONSESSIONCLOSED:
			// ?????????????????????????????????????????????
			clearTimeout(me.onsessionclosedSt);
			me.onsessionclosedSt = setTimeout(function(){
				me.callbackApi.onsessionclosed();
			}, 500);
			break;
		case _const.EVENTS.ONSESSIONCREAT:
			me.callbackApi.onsessioncreat(data);
			break;
		case _const.EVENTS.CACHEUSER:
			// ??????im username
			utils.set(
				data.key,
				data.value
			);
			break;
		case _const.EVENTS.DRAGREADY:
			_startPosition.x = +data.x || 0;
			_startPosition.y = +data.y || 0;

			utils.addClass(me.iframe, "easemobim-dragging");
			utils.addClass(me.shadow, "easemobim-dragging");

			utils.on(document, "mousemove", me._onMouseMove);
			break;
		case _const.EVENTS.DRAGEND:
			_moveend.call(me);
			break;
		case _const.EVENTS.SET_ITEM:
			utils.setStore(msg.data.key, msg.data.value);
			break;
		case _const.EVENTS.REQUIRE_URL:
			me.down2Im.send({ event: _const.EVENTS.UPDATE_URL, data: location.href });
			break;
		case _const.EVENTS.SHOW_IMG:
			pcImgView(data);
			break;
		case _const.EVENTS.RESET_IFRAME:
			me._updatePosition(data);
			break;
		case _const.EVENTS.ADD_PROMPT:
			utils.addClass(me.iframe, "easemobim-has-prompt");
			break;
		case _const.EVENTS.REMOVE_PROMPT:
			utils.removeClass(me.iframe, "easemobim-has-prompt");
			break;
		case _const.EVENTS.SCROLL_TO_BOTTOM:
			me.iframe.scrollIntoView(false);
			break;
		case _const.EVENTS.INVITATION_INIT:
			inviteBox = new InviteBox(data, me.config);
			// CLOUD-15301 ???dev47.35??????????????????bind????????????????????????????????????????????????????????????????????????????????????????????????
			!isOpened && inviteBox.beginStartTimer();
			break;
		case _const.EVENTS.REOPEN:
			// ????????????????????????
			me.callbackApi.onopen();
			break;
		case _const.EVENTS.EVALUATIONSUBMIT:
			// ??????????????????
			me.callbackApi.onEvaluationsubmit();
			break;
		default:
			break;
		}
		// from Im
	}, ["toHost"]);

	// ??????ready??????????????????
	for(i = 0, l = me.extendMessageList.length; i < l; i++){
		me.down2Im.send({ event: _const.EVENTS.EXT, data: me.extendMessageList[i] });
	}
	for(i = 0, l = me.textMessageList.length; i < l; i++){
		me.down2Im.send({ event: _const.EVENTS.TEXTMSG, data: me.textMessageList[i] });
	}

	typeof me.ready === "function" && me.ready();

	// eventListener.add(_const.SYSTEM_EVENT.ACCEPT_INVITATION, function(){
	// 	// ???????????????show??????????????????????????????????????????
	// 	me.down2Im.send({ event: _const.EVENTS.SHOW});
	// 	setTimeout(function() {
	// 		me.open();
	// 	}, 50);
	// });
}

function Iframe(config){
	var me = this;
	var id = "easemob-iframe-" + utils.uuid();
	var className = "easemobim-chat-panel easemobim-hide easemobim-minimized";
	var iframe = document.createElement("iframe");
	var shadow;
	
	utils.isMobile && (className += " easemobim-mobile");

	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	iframe.allow = "microphone; camera";
	document.body.appendChild(iframe);

	utils.on(iframe, "load", function(){
		_ready.call(me);
	});

	if(!utils.isMobile){
		shadow = document.createElement("div");
		shadow.className = "easemobim-iframe-shadow";
		document.body.appendChild(shadow);
		utils.on(shadow, "mouseup", function(){
			_moveend.call(me);
		});
	}

	me.config = config;
	me.iframe = iframe;
	me.shadow = shadow;
	me.show = false;
	me._onMouseMove = function(ev){
		_move(me, ev);
	};
	me.textMessageList = [];
	me.extendMessageList = [];

	Iframe.iframe = me;

	return me;
}

Iframe.prototype.set = function(config, callback){
	var shadowBackgroundColor = "rgba(255,255,255,.4)";

	this.config = utils.copy(config || this.config);

	this.position = {
		x: this.config.dialogPosition.x.slice(0, -2),
		y: this.config.dialogPosition.y.slice(0, -2)
	};
	this.rect = {
		width: +this.config.dialogWidth.slice(0, -2),
		height: +this.config.dialogHeight.slice(0, -2)
	};

	this._updatePosition();

	utils.toggleClass(this.iframe, "easemobim-hide", this.config.hide);

	var params = [
		{name: 'configId', value: this.config.configId},
		{name: 'iframeId', value: this.iframe.id},
		{name: 'lang', value: this.config.lang},
	]
	if (this.config.hide !== '') {
		params.push({name: 'hideDefaultButton',value: this.config.hide})
	}
	this.iframe.src = config.path + '/index.html' + params.reduce((s, item) => {
		return s + '&' + item.name + '=' + item.value
	}, '?')

	// this.iframe.src = config.path + '/index.html?configId=' + this.config.configId + '&iframeId=' + this.iframe.id + '&lang=' + this.config.lang + '&hideDefaultButton=' + this.config.hide;
	// this.shadow && (this.shadow.style.backgroundColor = shadowBackgroundColor);

	this.ready = callback;
	titleSlide.enable = config.titleSlide;

	return this;
};

Iframe.prototype._updatePosition = function(newData){
	var iframe = this.iframe;
	var shadow = this.shadow;
	var config = newData || this.config;

	iframe.style.width = config.dialogWidth;
	iframe.style.height = config.dialogHeight;
	iframe.style.right = config.dialogPosition.x;
	iframe.style.bottom = config.dialogPosition.y;

	if(shadow){
		shadow.style.width = config.dialogWidth;
		shadow.style.height = config.dialogHeight;
		shadow.style.right = config.dialogPosition.x;
		shadow.style.bottom = config.dialogPosition.y;
	}
};

Iframe.prototype.open = function(){
	var iframe = this.iframe;
	inviteBox && inviteBox.clearInvitation();
	isOpened = true;

	if(this.show) return this;
	this.show = true;

	// ????????????????????????????????????
	if(utils.isMobile){
		utils.addClass(document.body, "easemobim-mobile-body");
		utils.addClass(document.documentElement, "easemobim-mobile-html");
	}

	utils.removeClass(iframe, "easemobim-minimized");
	utils.removeClass(iframe, "easemobim-hide");

	this.down2Im && this.down2Im.send({ event: _const.EVENTS.SHOW });

	return this;
};

Iframe.prototype.close = function(){
	if(this.show === false) return this;
	this.show = false;

	clearTimeout(_st);
	// ????????????????????????
	if(utils.isMobile){
		utils.removeClass(document.body, "easemobim-mobile-body");
		utils.removeClass(document.documentElement, "easemobim-mobile-html");
	}

	utils.addClass(this.iframe, "easemobim-minimized");
	// utils.addClass(this.iframe, "easemobim-hide");
	utils.toggleClass(this.iframe, "easemobim-hide", this.config.hide); // this.config.hide ?????????????????????

	this.down2Im && this.down2Im.send({ event: _const.EVENTS.CLOSE });
	return this;
};

// ??? ext ??????
Iframe.prototype.send = function(extMsg){
	if(this.down2Im){
		this.down2Im.send({ event: _const.EVENTS.EXT, data: extMsg });
	}
	else{
		// ????????????????????????????????????ready ?????????
		this.extendMessageList.push(extMsg);
	}
};

// ???????????????
Iframe.prototype.sendText = function(msg){
	if(this.down2Im){
		this.down2Im.send({ event: _const.EVENTS.TEXTMSG, data: msg });
	}
	else{
		this.textMessageList.push(msg);
	}
};
// ??????????????????????????????
Iframe.prototype.hideDefaultBtn = function(){
	this.down2Im.send({ event: _const.EVENTS.HIDE_DEFAULT_BTN, data: {} });
};

module.exports = Iframe;
