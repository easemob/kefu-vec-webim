import WebIM from 'easemob-kefu-webim'
import profile from '@/tools/profile'
import utils from '@/tools/utils'
import tools from '@/tools/tools'
import event from '@/tools/event'
import Dict from '@/tools/Dict'
import List from '@/tools/List'
import commonConfig from '@/common/config'
import { getConfig, getConfigOption, getRelevanceListConfig, tenantInfo } from '../assets/http/config'
import { createVisitor, getToken, grayScaleList } from '../assets/http/user'
import { SYSTEM_OFFLINE, HEART_BEAT_INTERVAL, SYSTEM_CHAT_CLOSED, SYSTEM_CLEAR_AGENTSTATE, SYSTEM_CLEAR_AGENTINPUTSTATE, SYSTEM_IS_PULL_HISTORY, SYSTEM_NEW_OFFICIAL_ACCOUNT_FOUND, SYSTEM_OFFICIAL_ACCOUNT_UPDATED, SYSTEM_VIDEO_TICKET_RECEIVED, SYSTEM_VIDEO_ARGO_END, SYSTEM_WHITE_BOARD_RECEIVED, WEBIM_CONNCTION_AUTH_ERROR, WEBIM_CONNCTION_CALLBACK_INNER_ERROR, SYSTEM_AGENT_INFO_UPDATE, SYSTEM_EVENT_MSG_TEXT, SYSTEM_VIDEO_ARGO_REJECT, SYSTEM_SESSION_TRANSFERED, SYSTEM_SESSION_TRANSFERING, SYSTEM_SESSION_CLOSED, SYSTEM_SESSION_OPENED,SESSION_STATE_PROCESSING,SYSTEM_SESSION_CREATED, SYSTEM_VIDEO_CALLBACK_TICKET, SYSTEM_AGENT_CANCALCALLBACK, SYSTEM_ENQUIRY_INVITE, SYSTEM_RTCSESSION_INFO, SYSTEM_VIDEO_CALLBACK } from '@/assets/constants/events'
import queryString from 'query-string'

var handleConfig = commonConfig.handleConfig;

// 收消息队列
var receiveMsgDict = new Dict();
var conn
var config = commonConfig.getConfig()

var _open = tools.retryThrottle(function(){
	var op = {
		user: commonConfig.getConfig().user.username,
		appKey: commonConfig.getConfig().appKey,
		apiUrl: location.protocol + "//" + commonConfig.getConfig().restServer
	};

	if(profile.imToken !== null){
		op.accessToken = profile.imToken;
	}
	else{
		op.pwd = commonConfig.getConfig().user.password;
	}

	conn.open(op);
}, {
	resetTime: 10 * 60 * 1000,
	waitTime: 2000,
	retryLimit: 100 // 重连次数改为100次
});

function _attemptToAppendOfficialAccount(officialAccountInfo){
	var id = officialAccountInfo.official_account_id;
	var targetOfficialAccount = profile.officialAccountList.find(item => item.official_account_id === id)

	// 如果相应messageView已存在，则不处理
	if(targetOfficialAccount) return;

	var type = officialAccountInfo.type;
	var img = officialAccountInfo.img;
	var name = officialAccountInfo.name;
	// copy object
	var officialAccount = {
		official_account_id: id,
		type: type,
		img: img,
		name: name
	};

	if(type === "SYSTEM"){
        if (Object.keys(profile.systemOfficialAccount).length === 0) {
			profile.systemOfficialAccount = officialAccount;
			profile.officialAccountList.push(officialAccount);
			officialAccount.unopenedMarketingTaskIdList = new List();
			officialAccount.unrepliedMarketingTaskIdList = new List();
			officialAccount.unreadMessageIdList = new List();
			event.emit(
				SYSTEM_NEW_OFFICIAL_ACCOUNT_FOUND,
				[officialAccount]
			);
		}
		else if(profile.systemOfficialAccount.official_account_id !== id){
			// 如果id不为null则更新 systemOfficialAccount
			profile.systemOfficialAccount.official_account_id = id;
			profile.systemOfficialAccount.img = img;
			profile.systemOfficialAccount.name = name;
			event.emit(SYSTEM_OFFICIAL_ACCOUNT_UPDATED, []);
		}
	}
	// 没有使用（无用户）
	else if(type === "CUSTOM"){
		profile.ctaEnable = true;
		profile.officialAccountList.push(officialAccount);
		officialAccount.unopenedMarketingTaskIdList = new List();
		officialAccount.unrepliedMarketingTaskIdList = new List();
		officialAccount.unreadMessageIdList = new List();
		event.emit(
			SYSTEM_NEW_OFFICIAL_ACCOUNT_FOUND,
			[officialAccount]
		);
	}
	else{
		throw new Error("unexpected official_account type.");
	}
}

function _getOfficialAccountById(id){
	// 默认返回系统服务号
	if(!id){
		return profile.systemOfficialAccount;
	}
	return profile.officialAccountList.find(item => item.official_account_id === id)
}

function _handleMessage(msg, options){
	console.log('ws msg', msg)
	var opt = options || {};
	var type = opt.type || (msg && msg.type);
	var noPrompt = opt.noPrompt;
	var isHistory = opt.isHistory;
	var eventName = utils.getDataByPath(msg, "ext.weichat.event.eventName");
	var eventObj = utils.getDataByPath(msg, "ext.weichat.event.eventObj");
	var msgId = utils.getDataByPath(msg, "ext.weichat.msgId")
		// 这是自己发出去的消息的 msgId，此为临时修改，在完成 messageBuilder 之后应该就可以去掉了
		|| utils.getDataByPath(msg, "ext.weichat.msg_id_for_ack");
	var isReceived = typeof opt.isReceived === "boolean"
		? opt.isReceived
		// from 不存在默认认为是收到的消息
		: (!msg.from || (msg.from.toLowerCase() !== config.user.username.toLowerCase()));
	var officialAccount = utils.getDataByPath(msg, "ext.weichat.official_account");
	var officialAccountId = officialAccount && officialAccount.official_account_id;
	var videoTicket = utils.getDataByPath(msg, "ext.msgtype.sendVisitorTicket.ticket");
	var sendVisitorCallback = utils.getDataByPath(msg, "ext.msgtype.sendVisitorCallback"); // 回呼
	var videoCallbackTicket = utils.getDataByPath(msg, "ext.msgtype.sendVisitorCallbackTicket.ticket"); // 回呼ticket
	var ssid = utils.getDataByPath(msg, 'ext.weichat.service_session.serviceSessionId')
	videoTicket && (videoTicket.ssid = ssid)
	videoCallbackTicket && (videoCallbackTicket.ssid = ssid)

	var msgAction = utils.getDataByPath(msg, 'action');
	var whiteBoardTicket = utils.getDataByPath(msg, "ext.msgtype.roomData");
	var videoEndArgo = utils.getDataByPath(msg, "ext.msgtype.videoPlayback");
	var customMagicEmoji = utils.getDataByPath(msg, "ext.msgtype.customMagicEmoji");
	var agentCancelCallback = utils.getDataByPath(msg, 'ext.msgtype.agentCancelCallback')
	var enquiryInvite = utils.getDataByPath(msg, "ext.msgtype.enquiryInvite");
	var rtcSessionInfo = utils.getDataByPath(msg, 'ext.msgtype.rtcSession')
	var targetOfficialAccount;
	var message;
	msg.fileLength = msg.fileLength || msg.file_length || (msg.ext&& msg.ext.file_length) || "";

	// 重复消息不处理
	if(receiveMsgDict.get(msgId)){
		return;
	}
	// 消息加入去重列表
	else if(msgId){
		receiveMsgDict.set(msgId, msg);
	}
	// 没有 msgId 忽略，继续处理（KEFU-ACK 消息没有 msgId）
	else{
	}
	// 绑定访客的情况有可能会收到多关联的消息，不是自己的不收
	if(!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !noPrompt){
		return;
	}
	// 撤回的消息不处理
	if(utils.getDataByPath(msg, "ext.weichat.recall_flag") === 1){
		return;
	}
	// 尝试
	if(officialAccount){
		_attemptToAppendOfficialAccount(officialAccount);
	}
	targetOfficialAccount = _getOfficialAccountById(officialAccountId);

	if(targetOfficialAccount && targetOfficialAccount.agentState == "Online"){
		profile.isAgentStateOnline = true;
	}
	// ===========
	// 消息类型判断
	// ===========
	// 满意度评价
	if(utils.getDataByPath(msg, "ext.weichat.ctrlType") === "inviteEnquiry"){
		type = "satisfactionEvaluation";
	}
	// 机器人自定义菜单
	// 需要判断：收到的 choice 显示为菜单，发出的 choice 渲染为文本消息
	else if(
		isReceived
		&& utils.getDataByPath(msg, "ext.msgtype.choice.title")
		&& utils.getDataByPath(msg, "ext.msgtype.choice.items")
		&& !utils.getDataByPath(msg, "ext.msgtype.choice.mode")
	){
		type = "robotList";
	}
	// 待接入超时转留言
	else if(
		eventName === "ServiceSessionWillScheduleTimeoutEvent"
		&& eventObj
		&& eventObj.ticketEnable === "true"
	){
		type = "transferToTicket";
	}
	else if(utils.getDataByPath(msg, "ext.msgtype.articles")){
		type = "article";
	}
	// track 消息在访客端不与处理
	else if(utils.getDataByPath(msg, "ext.msgtype.track")){
		type = "track";
	}
	// order 消息在访客端不与处理
	else if(utils.getDataByPath(msg, "ext.msgtype.order")){
		type = "order";
	}
	else if(utils.getDataByPath(msg, "ext.type") === "html/form"){
		type = "html-form";
	}
	// 视频 ticket
	else if(videoTicket){
		type = "rtcVideoTicket";
	}
	else if (sendVisitorCallback) { // 回呼
		type = 'sendVisitorCallback'
	}
	else if (videoCallbackTicket) {
		type = 'videoCallbackTicket'
	} 
	else if(videoEndArgo){
		type = "videoEndArgo";
	}
	else if(whiteBoardTicket){
		type = "whiteBoardTicket";
	}
	else if(customMagicEmoji){
		type = "customMagicEmoji";
	}
	else if (msgAction === 'AgentRejectKefuRtcRingingCall') { // 客服拒接
		type = 'agentRejectVideoTicket';
	}
	else if (agentCancelCallback) {
		type = 'agentCancelCallback'
	}
	else if (enquiryInvite) { // 邀请评价
		type = 'enquiryInvite';
	}
	else if(rtcSessionInfo) {
		type = 'rtcSessionInfo'
	}
	else if(
		isReceived
		&& utils.getDataByPath(msg, "ext.msgtype.choice.mode") == "transferManualGuide"
	){
		type = "transferManualGuide";
	}
	else{

	}

	// ===========
	// 消息结构构造
	// ===========
	switch(type){
	case "txt":
		message = msg;
		message.type = type;
		message.data = (msg && msg.data) || "";
		// message.brief = textParser.getTextMessageBrief(message.data,isReceived);
		break;
	case "img":
		message = msg;
		message.type = type;
		// message.brief = __("message_brief.picture");
		break;
	case "file":
		message = msg;
		message.type = type;
		// message.brief = __("message_brief.file");
		break;
	case "video":
		message = msg;
		message.type = type;
		// message.brief = __("message_brief.video");	// 页面接收提示视频
		break;
	case "article":
	case "track":
	case "order":
		message = msg;
		message.type = type;
		break;
	case "customMagicEmoji":
		message = customMagicEmoji;
		message.type = type;
		// message.brief = __("message_brief.emoji");
		break;
	case "html-form":
		message = msg;
		message.type = type;
		// message.brief = __("message_brief.unknown");
		break;
	case "cmd":
		var action = msg.action;
		if(action === "KF-ACK"){
				// 清除 ack 对应的 site item
			// _clearTS(msg.ext.weichat.ack_for_msg_id);
			return;
		}
		else if(action === "KEFU_MESSAGE_RECALL"){
				// 撤回消息命令
			var recallMsgId = msg.ext.weichat.recall_msg_id;
			var dom = document.getElementById(recallMsgId);
			utils.addClass(dom, "hide");
		}
		break;
	case "rtcVideoTicket":
		event.emit(SYSTEM_VIDEO_TICKET_RECEIVED, videoTicket);
		break;
	case 'sendVisitorCallback':
		event.emit(SYSTEM_VIDEO_CALLBACK, sendVisitorCallback);
		break;
	case 'videoCallbackTicket':
		event.emit(SYSTEM_VIDEO_CALLBACK_TICKET, videoCallbackTicket)
		break;
	// case "satisfactionEvaluation":
    // case "robotList":
    // case "transferManualGuide":
    // case "skillgroupMenu":
    // // 入口指定
	// case "transferManualMenu":
    // case "robotTransfer":
    // case "transferToTicket":
    case "videoEndArgo":
		message = msg;
		message.type = "txt";
		message.data = (msg && msg.data) || "";
		// message.brief = textParser.getTextMessageBrief(message.data,isReceived);
		event.emit(SYSTEM_VIDEO_ARGO_END, videoEndArgo);
		break;
	case 'agentRejectVideoTicket':
		event.emit(SYSTEM_VIDEO_ARGO_REJECT, {agentReject: true});
		break;
	case "whiteBoardTicket":
		message = msg;
		message.type = "txt";
		message.data = (msg && msg.data) || "";
		// message.brief = textParser.getTextMessageBrief(message.data,isReceived);
		event.emit(SYSTEM_WHITE_BOARD_RECEIVED, whiteBoardTicket);
		break;
	case 'agentCancelCallback':
		event.emit(SYSTEM_AGENT_CANCALCALLBACK, agentCancelCallback);
		break;
	case 'enquiryInvite':
		event.emit(SYSTEM_ENQUIRY_INVITE, enquiryInvite);
		break;
	case 'rtcSessionInfo':
		event.emit(SYSTEM_RTCSESSION_INFO, rtcSessionInfo)
		break;
	default:
		console.error("unexpected msg type");
		break;
	}

	if(!isHistory){
		// 实时消息需要处理系统事件
		if(eventName){
			_handleSystemEvent(eventName, eventObj, msg);
		}
		else{
			var agentInfo = utils.getDataByPath(msg, "ext.weichat.agent");
			var isThirdAgent = utils.getDataByPath(msg, "ext.msgtype.sendVisitorTicket.ticket.isThirdAgent");
			if(agentInfo && !isThirdAgent){
				targetOfficialAccount.agentNickname = agentInfo.userNickname;
				targetOfficialAccount.agentAvatar = agentInfo.avatar;
				event.emit(SYSTEM_AGENT_INFO_UPDATE, targetOfficialAccount);
			}
		}
	}
}

function _handleSystemEvent(eventName, eventObj, msg){
	var eventMessageText = SYSTEM_EVENT_MSG_TEXT[eventName];
	var officialAccountId = utils.getDataByPath(msg, "ext.weichat.official_account.official_account_id");
	var officialAccount = _getOfficialAccountById(officialAccountId);
	var agentType = utils.getDataByPath(msg, "ext.weichat.event.eventObj.agentType");

	switch(eventName){
	case SYSTEM_SESSION_TRANSFERED:
		// officialAccount.agentId = eventObj.userId;
		// officialAccount.agentType = eventObj.agentType;
		// officialAccount.agentAvatar = eventObj.avatar;
		// officialAccount.agentNickname = eventObj.agentUserNiceName;
		// officialAccount.sessionState = SESSION_STATE_PROCESSING;
		// officialAccount.isSessionOpen = true;
		// profile.latestNiceName = null;
		// event.emit(_const.SYSTEM_EVENT.STOP_TIMEOUT, [officialAccount]);
		break;
	case SYSTEM_SESSION_TRANSFERING:
		// officialAccount.sessionState = _const.SESSION_STATE.WAIT;
		// officialAccount.isSessionOpen = true;
		// officialAccount.skillGroupId = null;
		// eventListener.excuteCallbacks(_const.SYSTEM_EVENT.STOP_TIMEOUT, [officialAccount]);
		// profile.latestNiceName = null;  // 转接时把最近一次名称置空
		break;
	case SYSTEM_SESSION_CLOSED:
		// 如果在会话结束前已经发起了满意度评价，在结束时开始计算失效时间
		// evaluateFlag = true;
		// var serviceId = msg.ext.weichat.service_session.serviceSessionId;
		// var btnInvalid = $(".em-btn-list>button[data-servicesessionid=" + serviceId + "]");
		// if(btnInvalid){
		// 	apiHelper.getEvaluatePrescription().then(function(res){
		// 		if(!res){
		// 			res = 8 * 3600;
		// 		}
		// 		setTimeout(function(){
		// 			btnInvalid.removeClass("bg-hover-color");
		// 			btnInvalid.removeClass("js_satisfybtn");
		// 			btnInvalid.text(__("chat.invalid"));
		// 			btnInvalid.addClass("invalid-btn");
		// 		}, res * 1000);
		// 	});
		// }
		// officialAccount.sessionState = _const.SESSION_STATE.ABORT;
		// officialAccount.agentId = null;
		// // 发起满意度评价需要回传sessionId，所以不能清空
		// // officialAccount.sessionId = null;
		// officialAccount.skillGroupId = null;
		// officialAccount.isSessionOpen = false;
		// officialAccount.hasReportedAttributes = false;
		// profile.latestNiceName = null;  // 结束会话把最近一次名称置空
		// // to topLayer
		// getToHost.send({ event: _const.EVENTS.ONSESSIONCLOSED });
		break;
	case SYSTEM_SESSION_OPENED:
		officialAccount.sessionState = SESSION_STATE_PROCESSING;
		officialAccount.agentType = eventObj.agentType;
		officialAccount.agentId = eventObj.userId;
		officialAccount.sessionId = eventObj.sessionId;
		officialAccount.agentAvatar = eventObj.avatar;
		officialAccount.agentNickname = eventObj.agentUserNiceName;
		officialAccount.isSessionOpen = true;
		break;
	case SYSTEM_SESSION_CREATED:
		// officialAccount.sessionState = _const.SESSION_STATE.WAIT;
		// officialAccount.sessionId = eventObj.sessionId;
		// officialAccount.isSessionOpen = true;
		// getToHost.send({ event: _const.EVENTS.ONSESSIONCREAT });
		break;
	default:
		break;
	}
	event.emit(eventName, officialAccount);
	// _promptNoAgentOnlineIfNeeded({ officialAccountId: officialAccountId });
}

function _initConnection(){
	config = commonConfig.getConfig()
	// init connection
	conn = new WebIM.connection({
		url: config.xmppServer,
		retry: true,
		isMultiLoginSessions: true,
		heartBeatWait: HEART_BEAT_INTERVAL,
		https: true
	});

	conn.listen({
		onOpened: function(info){
			// discard this
			if(info && info.accessToken && (profile.imToken === null)){
				profile.imToken = info.accessToken;
			}

			conn.setPresence();
		},
		onTextMessage: function(message){
			_handleMessage(message, { type: "txt", notFromSystem: true });
		},
		onPictureMessage: function(message){
			_handleMessage(message, { type: "img" });
		},
		onFileMessage: function(message){
			_handleMessage(message, { type: "file" });
		},
		onVideoMessage: function(message){
			_handleMessage(message, { type: "video" });
		}, // 新增小视频类型
		onCmdMessage: function(message){
			_handleMessage(message, { type: "cmd" });
		},
		onOnline: function(){
			utils.isMobile && _open();
		},
		onOffline: function(){
			utils.isMobile && conn.close();

			event.emit(SYSTEM_OFFLINE, []);
		},
		onError: function(e){
			console.log(e);
			if(e.reconnect){
				// _open();
				// 在移动端会触发多次重连，导致自己多次登录，影响多端登录的判断
				!utils.isMobile && _open();
			}
			else if(e.type === WEBIM_CONNCTION_AUTH_ERROR){
				_open();
			}
			// im sdk 会捕获回调中的异常，需要把出错信息打出来
			else if(e.type === WEBIM_CONNCTION_CALLBACK_INNER_ERROR){
				console.error(e.data);
			}
			else{
				console.error(e);
			}
			// 当多端登录挤掉上一个ws链接的时候给出提示
			if(e.type == "Replaced by new connection"){
				if(config.tenantId == "66639"){
					return false;
				}
				// 在收到多端登录信息时候，第二通道轮询暂且不清除。
				// TODO: 等查清楚重新连接以后第二通通道轮询没开启的原因再把这行注释解开
				// clearInterval(receiveMsgTimer);
				event.emit(SYSTEM_CHAT_CLOSED);
				event.emit(SYSTEM_CLEAR_AGENTSTATE);
				event.emit(SYSTEM_CLEAR_AGENTINPUTSTATE);
				event.emit(SYSTEM_IS_PULL_HISTORY);
				return false;
			}
		}
	});

	// open connection
	_open();
}

// 初始化配置
commonConfig.setConfig({
	configId: queryString.parse(location.search).configId || ''
})
async function initConfig() {
	const {status, entity} = await getConfig(commonConfig.getConfig().configId)
	if (status === 'OK') {
		entity.configJson = JSON.parse(entity.configJson)
		entity.configJson.tenantId = entity.tenantId;
		entity.configJson.configName = entity.configName;
		handleConfig(entity.configJson);

		await initRelevanceList(entity.tenantId);

		console.log('config end')
	}
}

async function initRelevanceList(tenantId){
	// 获取关联信息（targetChannel）
	const [value, _relevanceList, info, grayScale] = await Promise.all([
		getConfigOption({
			configId: commonConfig.getConfig().configId,
			tenantId
		}),
		getRelevanceListConfig({tenantId}),
		tenantInfo({tenantId}),
		grayScaleList(tenantId)
	])

	if (value.status && value.status === 'OK') {
		commonConfig.setConfig({
			configOption: _.extend({}, commonConfig.getConfig().configOption, value),
		});
	}

	if (info.status && info.status === 'OK') {
		commonConfig.setConfig({
			tenantInfo: info.entity,
		});
	}

	// 灰度列表
	if (grayScale.status && grayScale.status === 'OK') {
		var garyRes = {}
		grayScale.entities.forEach(item => {
			garyRes[item.grayName] = item.status !== 'Disable'
		})
		profile.grayList = garyRes
	} else {
		profile.grayList = {}
	}

	await handleCfgData(_relevanceList || [], []);
}

// todo: rename this function
async function handleCfgData(relevanceList){
	var targetItem;
	var appKey = commonConfig.getConfig().appKey;
	var splited = appKey.split("#");
	var orgName = splited[0];
	var appName = splited[1];
	var toUser = commonConfig.getConfig().toUser || commonConfig.getConfig().to;

	// toUser 转为字符串， todo: move it to handle config
	typeof toUser === "number" && (toUser = toUser.toString());

	if(appKey && toUser){
		// appKey，imServiceNumber 都指定了
		targetItem = relevanceList.find(item => item.orgName === orgName && item.appName === appName && item.imServiceNumber === toUser)
	}

	// 未指定appKey, toUser时，或未找到符合条件的关联时，默认使用关联列表中的第一项
	if(!targetItem){
		targetItem = targetItem || relevanceList[0];
		// 防止关联列表是空的情况js报错（海外环境）
		if(!targetItem){
			targetItem = {
				imServiceNumber:""
			}
		}
		console.log("mismatched channel, use default.");
	}
	commonConfig.setConfig({
		logo: commonConfig.getConfig().logo || { enabled: !!targetItem.tenantLogo, url: targetItem.tenantLogo },
		toUser: targetItem.imServiceNumber,
		orgName: targetItem.orgName,
		appName: targetItem.appName,
		channelId: targetItem.channelId,
		appKey: targetItem.orgName + "#" + targetItem.appName,
		restServer: commonConfig.getConfig().restServer || targetItem.restDomain,
		xmppServer: commonConfig.getConfig().xmppServer || targetItem.xmppServer,
		staticPath: commonConfig.getConfig().staticPath || "",
		offDutyWord: commonConfig.getConfig().offDutyWord || '现在是下班时间。',
		emgroup: commonConfig.getConfig().emgroup || "",
		timeScheduleId: commonConfig.getConfig().timeScheduleId || 0,

		user: commonConfig.getConfig().user || {},
		visitor: commonConfig.getConfig().visitor || {},
		routingRuleFlag: commonConfig.getConfig().routingRuleFlag || "",
		channel: commonConfig.getConfig().channel || {},
		ui: commonConfig.getConfig().ui || {
			H5Title: {}
		},
		toolbar: commonConfig.getConfig().toolbar || {
			sendAttachment: true,
			sendSmallVideo:commonConfig.getConfig().configId ? false : true,
		},
		chat: commonConfig.getConfig().chat || {},
		options: commonConfig.getConfig().options || {
			onlyCloseWindow: "true", // 访客离开下面的开关，默认不会传该值，默认为true 这样不影响之前的逻辑
			onlyCloseSession: "true", // 访客离开下面的开关，默认不会传该值，默认为true 这样不影响之前的逻辑
			showEnquiryButtonInAllTime: "false", //是否在所有时间段显示主动评价按钮,默认不会传该值，默认值为"false"，即只在坐席接待时显示主动评价按钮
			closeSessionWhenCloseWindow: "false" // 是否在关闭聊窗的时候关闭会话，默认不会传该值，默认值为"false"
		}
	});

	// fake patch: 老版本配置的字符串需要decode
	if(commonConfig.getConfig().offDutyWord){
		try{
			commonConfig.setConfig({
				offDutyWord: decodeURIComponent(commonConfig.getConfig().offDutyWord)
			});
		}
		catch(e){}
	}

	if(commonConfig.getConfig().emgroup){
		try{
			commonConfig.setConfig({
				emgroup: decodeURIComponent(commonConfig.getConfig().emgroup)
			});
		}
		catch(e){}
	}

	// 获取企业头像和名称
	// todo: rename to tenantName
	profile.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, commonConfig.getConfig().domain);
	profile.defaultAgentName = targetItem.tenantName;
	profile.defaultAvatar = commonConfig.getConfig().staticPath + "/img/default_avatar.png";

	// 从这里开始区分是否进行创建用户
	var cacheKeyName = (commonConfig.getConfig().configId || (commonConfig.getConfig().to + commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup));
	if (utils.get(cacheKeyName)) {
		commonConfig.setConfig({
			user: {
				username: utils.get(cacheKeyName),
				password: utils.get('pass' + cacheKeyName)
			}
		})

		config = commonConfig.getConfig()

		_initConnection()
	} else {
		await setUserInfo()
	}
}

async function setUserInfo() {
	// 创建用户
	var info = await createVisitor({
		appName: commonConfig.getConfig().appName,
		imServiceNumber: commonConfig.getConfig().toUser,
		orgName: commonConfig.getConfig().orgName,
		specifiedUserName: '',
		tenantId: commonConfig.getConfig().tenantId
	})

	commonConfig.setConfig({
		user: {
			password: info.userPassword,
			username: info.userId
		}
	})

	// 设置cookie
	var cacheKeyName = (commonConfig.getConfig().configId || (commonConfig.getConfig().to + commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup));
	utils.set(cacheKeyName, info.userId);
	utils.set('pass' + cacheKeyName, info.userPassword);
	
	await getUserToken()
}

async function getUserToken() {
	if (profile.imToken) {
		_initConnection()
	} else {
		var resp = await getToken()
		// cache token
		profile.imToken = resp.access_token;
		_initConnection()
	}
}

function _sendText(message, ext = {}) {
	var id = utils.uuid();
	var msg = new WebIM.message.txt(id);
	msg.set({
		msg: message,
		to: config.toUser,
		// 此回调用于确认im server收到消息, 有别于kefu ack
		success: function(/* id */){},
		fail: function(/* id */){}
	});

	if(ext){
		Object.assign(msg.body, ext);
	}
	_setExt(msg);
	conn.send(msg.body);
}

// 挂断视频
function _sendCmdExitVideo(callId, ext){
	var id = utils.uuid();
	var msg = new WebIM.message.cmd(id);
	var msgAction = "Agorartcmedia";
	msg.set({
		to: config.toUser,
		action: msgAction,
	});
	if(ext){
		Object.assign(msg.body, ext)
		// _.extend();
	}
	_setExt(msg);
	conn.send(msg.body);
}


function _setExt(msg){
	var officialAccount = profile.currentOfficialAccount || profile.systemOfficialAccount;
	var officialAccountId = officialAccount.official_account_id;
	var bindAgentUsername = officialAccount.bindAgentUsername;
	var bindSkillGroupName = officialAccount.bindSkillGroupName;
	var language = 'zh-CN';
	var customExtendMessage = commonConfig.customExtendMessage;
	var rulaiExtendMessage = commonConfig.getConfig().rulaiExtendMessage;

	msg.body.ext = msg.body.ext || {};
	msg.body.ext.weichat = msg.body.ext.weichat || {};
	msg.body.ext.file_length = msg.fileLength;

	msg.body.ext.weichat.language = language;

	// 对接百度机器人，增加消息扩展
	if(typeof customExtendMessage === "object"){
		Object.assign(msg.body.ext, customExtendMessage)
	}

	// 对接敦煌网(如来机器人)，增加消息扩展
	if(typeof rulaiExtendMessage === "object"){
		Object.assign(msg.body.ext, rulaiExtendMessage);
	}

	// bind skill group
	if(bindSkillGroupName){
		msg.body.ext.weichat.queueName = bindSkillGroupName;
	}
	else if(config.emgroup){
		msg.body.ext.weichat.queueName = msg.body.ext.weichat.queueName || config.emgroup;
	}

	// bind visitor
	// 访客将nicename放在第一条消息的扩展字段中
	var imId = utils.get("root" + (config.configId || (config.tenantId + config.emgroup)));
	if(Object.keys(config.visitor).length){
		msg.body.ext.weichat.visitor = config.visitor;
		if(config.visitor && !config.visitor.userNickname){
			msg.body.ext.weichat.visitor.userNickname = commonConfig.getConfig().userNicknameFlg;
		}
	}
	else{
		msg.body.ext.weichat.visitor = {
			userNickname:commonConfig.getConfig().userNicknameFlg
		}
	}

	// bind agent username
	if(bindAgentUsername){
		msg.body.ext.weichat.agentUsername = bindAgentUsername;
	}
	else if(config.agentName){
		msg.body.ext.weichat.agentUsername = config.agentName;
	}

	// set growingio id
	if(config.grUserId){
		msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
		msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
	}

	// 初始化时系统服务号的ID为defaut，此时不用传
	if(officialAccountId !== "default"){
		msg.body.ext.weichat.official_account = {
			official_account_id: officialAccountId
		};
	}
	if(!!config.routingRuleFlag){
		msg.body.ext.weichat.routingRuleFlag = config.routingRuleFlag;
	}
}

export default {
    initConnection: initConfig,
    handleMessage: _handleMessage,
	sendText: _sendText,
	cancelVideo: _sendCmdExitVideo,
	attemptToAppendOfficialAccount: _attemptToAppendOfficialAccount,
}
