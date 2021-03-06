require("underscore");
var utils = require("./common/utils");
var loading = require("./loading");
var Iframe = require("./iframe");
var configB = require('./common/config')
var tenantList = {};
var DEFAULT_CONFIG;

// get parameters from easemob.js
var baseConfig = getScriptConfig();
var _config = {};
var iframe;
var bind;

window.easemobvec = window.easemobvec || {};
window.easemobvec.config = window.easemobvec.config || {};
window.easemobvec.version = "__WEBIM_PLUGIN_VERSION__";

import './plugin-scss/easemob.scss'

if(
	/MSIE 7\.0/.test(navigator.userAgent)
	&& !window.localStorage
	&& !document.querySelector
){
	easemobvec.bind = function(){
		alert("您使用的IE浏览器版本过低，请使用IE8以上版本的IE浏览器或Chrome浏览器"); // eslint-disable-line no-alert
	};
	throw new Error("unsupported browser.");
}

DEFAULT_CONFIG = {
	tenantId: "",
	to: "",
	agentName: "",
	appKey: "",
	domain: "",
	path: "",
	ticket: true,
	staticPath: "",
	// buttonText: __("common.contact_agent"),
	dialogWidth: "650px",
	dialogHeight: "650px",
	dragenable: true,
	minimum: true,
	soundReminder: true,
	titleSlide: true,
	dialogPosition: { x: "10px", y: "10px" },
	user: {
		username: "",
		password: "",
		token: ""
	},
	fromUrl: window.location.href,
	referer: document.referrer
};
// 店匠：两层iframe 着陆页获取特殊处理！！
if(DEFAULT_CONFIG.fromUrl == "about:blank"){
	DEFAULT_CONFIG.fromUrl = window.frameElement.baseURI
}

// init _config & concat config and global easemobim.config
function reset(config){
	var hide;
	var resources;
	var sat;
	// growing io user id
	// 由于存在 cookie 跨域问题，所以从配置传过去
	var configData = _.extend({}, DEFAULT_CONFIG, { grUserId: utils.get("gr_user_id") });
	config = config || {};
	configData = _.extend({}, configData, easemobvec.config, config);

	hide = utils.convertFalse(configData.hide) !== "" ? configData.hide : baseConfig.json.hide;
	resources = utils.convertFalse(_config.resources) !== "" ? configData.resources : baseConfig.json.resources;
	sat = utils.convertFalse(configData.satisfaction) !== "" ? configData.satisfaction : baseConfig.json.sat;

	configData = _.extend({}, configData, {
		tenantId: configData.tenantId || baseConfig.json.tenantId,
		configId: configData.configId || baseConfig.json.configId,
		hide: utils.convertFalse(hide),
		resources: utils.convertFalse(resources),
		satisfaction: utils.convertFalse(sat),
		domain: configData.domain || baseConfig.domain,
		path: configData.path || (baseConfig.domain + "__WEBIM_SLASH_KEY_PATH__"),
		staticPath: configData.staticPath || (baseConfig.domain + "__WEBIM_SLASH_KEY_PATH__"), // 用不到
		guestId: utils.getStore("guestId"), // 这个是别人种的cookie
		lang: configData.initLanguage || baseConfig.json.initLanguage || 'zh-CN' // 系统语言
	});
	// demo 页面点击联系客服带着 tenantId, 就删除 config 中的 configId, 否则 configId 存在就会用 configId 去渲染页面
	// if(config.tenantId){
	// 	configData.configId = "";
	// }
	setConfig(configData);
}

function setConfig(configExt){
	_config = _.extend({}, _config, configExt);
}

// get config from current script
function getScriptConfig(){
	var src;
	var obj = {};
	var scripts = document.scripts;
	var s, l, i, len;

	for(s = 0, l = scripts.length; s < l; s++){
		if(~scripts[s].src.indexOf("easemobvec.js")){
			// src 会被强制加上域名
			src = scripts[s].src;
			break;
		}
	}

	if(!src){
		return { json: obj, domain: "" };
	}

	var tmp;
	var idx = src.indexOf("?");
	var sIdx = ~src.indexOf("//") ? src.indexOf("//") : 0;
	var domain = src.slice(0, src.indexOf("/", sIdx + 2));
	var arr = src.slice(idx + 1).split("&");

	for(i = 0, len = arr.length; i < len; i++){
		tmp = arr[i].split("=");
		obj[tmp[0]] = tmp.length > 1 ? decodeURIComponent(tmp[1]) : "";
	}
	return { json: obj, domain: domain };
}

/*
 * @param: {String} 技能组名称，选填
 * 兼容旧版接口，建议使用easemobim.bind方法
 */
// window.easemobIM = function(group){
// 	easemobvec.bind({ emgroup: group });
// };
// window.easemobIMS = function(tenantId, group){
// 	easemobvec.bind({ tenantId: tenantId, emgroup: group });
// };

/*
 * @param: {Object} config
 */

bind = function(config, autoLoad){
	var cacheKeyName;
	var i;
	reset(config);
	// 自动加载的
	// 后续把此 if else 消除掉
	if(autoLoad){
		if(
			(!_config.hide || _config.autoConnect || _config.eventCollector)
			&& (_config.tenantId || _config.configId)
			// CLOUD-15297 【dev47.35】网页插件：手机端不弹出自动邀请弹窗
			// && !utils.isMobile
		){
			cacheKeyName = _config.configId || (_config.tenantId + (_config.emgroup || ""));
			if(!_config.user.username){
				// 从cookie里取用户名
				// keyName = [to + ] tenantId [ + emgroup]
				_config.isUsernameFromCookie = true;
				_config.user = {
					username: utils.get(
						_config.configId || ((_config.to || "") + _config.tenantId + (_config.emgroup || ""))
					)
				};
			}
			iframe = tenantList[cacheKeyName] || new Iframe(_config);
			tenantList[cacheKeyName] = iframe;
			iframe.set(_config, iframe.close);
			// 访客上报用后失效
			easemobvec.config.eventCollector = false;
		}
	}
	// 用户点击的
	else{
		// 防止空参数调用异常
		config = config || {};
		config.emgroup = config.emgroup || easemobvec.config.emgroup || "";

		cacheKeyName = config.configId || (config.tenantId + config.emgroup);

		for(i in tenantList){
			if(Object.prototype.hasOwnProperty.call(tenantList, i)){
				// if(tenantList[i].show){
				// 	return false
				// }
				tenantList[i].close();
			}
		}

		iframe = tenantList[cacheKeyName];

		if(iframe){
			iframe.open();
		}
		else{
			utils.isMobile && loading.show();
			if(!_config.user.username){
				// 从cookie里取用户名
				// keyName = [to + ] tenantId [ + emgroup]
				config.isUsernameFromCookie = true;
				config.user = {
					username: utils.get(
						_config.configId || ((_config.to || "") + _config.tenantId + (_config.emgroup || ""))
					)
				};
			}
			setConfig(config);

			if(!_config.tenantId && !_config.configId){
				console.error("No tenantId is specified.");
				return;
			}

			iframe = new Iframe(_config);
			tenantList[cacheKeyName] = iframe;

			iframe.set(_config, iframe.open);
		}
	}


};

// open api1: send custom extend message
easemobvec.sendExt = function(ext){
	if(iframe){
		iframe.send({
			ext: ext
		});
	}
	else{
		console.error("The chat window is not initialized.");
	}
};

// open api2: send text message
/*
 * @param: {object} 消息体
 * {
 *		data: "text msg",
 *		ext: {}
 * }
 */

 easemobvec.sendText = function(msg){
	if(iframe){
		iframe.sendText(msg);
	}
	else{
		console.error("The chat window is not initialized.");
	}
};

easemobvec.minimize = function(){
	if(iframe){
		iframe.close();
	}
};
easemobvec.restore = function(){
	if(iframe){
		iframe.open();
	}
};
// 隐藏默认联系客服按钮
easemobvec.hideDefaultBtn = function(){
	if(iframe){
		iframe.hideDefaultBtn();
	}
};
easemobvec.setDefaultConfig = function(config){
	if(iframe){
		iframe.open();
		config && iframe._updatePosition(config);
	}
};


// user click
window.easemobvec.bind = function(config){
	bind(config, false);
};

// auto load
bind({}, true);


// support cmd & amd
if(typeof module === "object" && typeof module.exports === "object"){
	module.exports = easemobim;
}
else if(typeof define === "function" && define.amd){
	define("easemob-kefu-webim-plugin", [], function(){
		return easemobim;
	});
}
