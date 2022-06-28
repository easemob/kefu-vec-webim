import request from "../../tools/request";
import commonConfig from '@/common/config'
import utils from '@/tools/utils'
import profile from '@/tools/profile'

var cache = {}

export function createVisitor(params) {
    return request({
        url: '/v1/webimplugin/visitors?tenantId=' + params.tenantId,
        data: params,
        method: 'post'
    })
}

export function getToken() {
    var config = commonConfig.getConfig()
    return request({
        url: location.protocol + "//" + config.restServer + "/" + config.orgName +
				"/" + config.appName + "/token",
        method: 'post',
        data: {
            grant_type: "password",
            username: config.user.username,
            password: config.user.password
        }
    })
}

// 访客挂断
export function visitorClose(ssid) {
    var config = commonConfig.getConfig()
    return request({
        url: `/v1/kefurtc/tenant/${config.tenantId}/session/${ssid}/visitor/${config.visitorInfo.userId}/close`,
        method: 'post'
    })
}

function getVisitorInfo(params) {
    return request({
        url: "/v1/webimplugin/tenants/" + params.tenantId
				+ "/visitors?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token
				+ "&techChannelInfo=" + params.techChannelInfo,
        // data: params,
        method: "GET"
    })
}

function getVisitorId(){
    var config = commonConfig.getConfig()
    var techChannelInfo = config.orgName
		+ "%23" + config.appName
		+ "%23" + config.toUser;
	return new Promise(function(resolve, reject){
		if(cache.visitorId){
			resolve(cache.visitorId);
		}
		else{
			getToken().then(function(token){
                // cache token
                profile.imToken = token.access_token;

				getVisitorInfo({
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					imServiceNumber: config.toUser,
					token: token.access_token,
                    techChannelInfo: techChannelInfo
				}).then(function(msg){
					// console.log(msg,"访客信息")
					// 存储访客信息
					commonConfig.setConfig({
						visitorInfo: msg.entity
					});
					var visitorId = utils.getDataByPath(msg, "entity.userId");
					if(visitorId){
						// cache visitor id
						cache.visitorId = visitorId;
						resolve(visitorId);
					}
					else{
						reject('visitor does not exist.');
					}
				}, function(err){
					reject(err);
				});
			});
		}
	});
}

function officalAccounts(params) {
    return request({
        url: "/v1/webimplugin/tenants/" + params.tenantId
				+ "/visitors/" + params.visitorId
				+ "/official-accounts?page=0&size=100"
				+ "&orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
		method: "GET",
    })
}

export function getOfficalAccounts() {
    var config = commonConfig.getConfig()
    return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			// profile.imToken ? null : getToken()
		]).then(function(result){
			var visitorId = result[0];
			// var token = result[1];

			officalAccounts({
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				visitorId: visitorId,
				token: profile.imToken
			}).then(function(msg){
				var list = utils.getDataByPath(msg, "entities");
				if(list.forEach){
					resolve(list);
				}
				else{
					resolve([]);
					console.error("unexpect data format: ", list);
				}
			}, function(err){
				reject(err);
			});
		})
		// 未创建会话时 visitor不存在，此时 getVisitorId 会reject 特定error，需要捕获此错误
		["catch"](function(err){
			reject(err);
		});
	});
}

// 租户灰度
export function grayScaleList(tenantId) {
	return request({
		url: `/v1/grayscale/tenants/${tenantId}`,
		method: 'get'
	})
}

// 访客排队
export function visitorWaiting(tenantId, rtcSessionId) {
	return request({
		url: `/v1/kefurtc/tenant/${tenantId}/webim/session/${rtcSessionId}/waiting`,
		method: 'get'
	})
}

// 访客评价
export function visitorEnquiry(tenantId, data) {
	return request({
		url: `/v1/kefurtc/tenant/${tenantId}/enquiry/visitor/submit`,
		method: 'post',
		data
	})
}
