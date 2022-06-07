import utils from "@/tools/utils"

var config = {};

function h5_mode_init(){
	config = {};
	config.tenantId = utils.query("tenantId");
	config.configId = utils.query("configId");
	config.offDutyType = utils.query("offDutyType");
	config.grUserId = utils.query("grUserId");
	config.domain = utils.query("domain") ? "//" + utils.query("domain") : "";

	// H5 方式集成时不支持eventCollector配置
	config.to = utils.convertFalse(utils.query("to"));
	config.xmppServer = utils.convertFalse(utils.query("xmppServer"));
	config.restServer = utils.convertFalse(utils.query("restServer"));
	config.agentName = utils.convertFalse(utils.query("agentName"));
	config.resources = utils.convertFalse(utils.query("resources"));
	config.hideStatus = utils.convertFalse(utils.query("hideStatus"));
	config.satisfaction = utils.convertFalse(utils.query("sat"));
	config.wechatAuth = utils.convertFalse(utils.query("wechatAuth"));
	config.hideKeyboard = utils.convertFalse(utils.query("hideKeyboard"));

	config.appKey = utils.convertFalse(decodeURIComponent(utils.query("appKey")));
	config.domain = config.domain || "//" + location.host;
	config.offDutyWord = decodeURIComponent(utils.query("offDutyWord"));
	config.ticket = utils.query("ticket") === "" ? true : utils.convertFalse(utils.query("ticket")); // true default
	config.emgroup = decodeURIComponent(utils.query("emgroup"));

	config.user = {};
	config.configOption = {};
	var usernameFromUrl = utils.query("user");

	var usernameFromCookie = utils.get("root" + (config.configId || (config.tenantId + config.emgroup)));
	// var userNickname = utils.get(usernameFromCookie);

	if(usernameFromUrl){
		config.user.username = usernameFromUrl;
	}
	else if(usernameFromCookie){
		config.user.username = usernameFromCookie;
		// config.user.userNickname = userNickname;
		config.isUsernameFromCookie = true;
	}
	else{}

	// fake transfer
	window.transfer = {
		send: function(){}
	};
}


function handleConfig(configJson){
	if(!configJson.options){
		configJson.options = {};
	}
	config.tenantId = configJson.tenantId;
	window.sessionStorage && sessionStorage.setItem("white_tenantId", config.tenantId);
	// todo: 把配置转换为新的
	// 用于config标记是否是来自于坐席端网页配置
	config.isWebChannelConfig = true;

	config.configName = configJson.configName;
	config.channel = configJson.channel;

	config.appKey = configJson.channel.appKey;
	config.to = configJson.channel.to;
	// config.agentName = configJson.channel.agentName;
	config.emgroup = configJson.channel.emgroup || '';

	config.options = configJson.options;
	config.videoH5Status = "";
	config.pageState = true;
}

function setConfig(extendConfig){
	config = _.extend({}, config, extendConfig);
}

function getConfig(){
	return JSON.parse(JSON.stringify(config));
}

export default {
	getConfig: getConfig,
	h5_mode_init: h5_mode_init,
	handleConfig: handleConfig,
	setConfig: setConfig,
}
