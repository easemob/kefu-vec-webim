import request from "../../tools/request";
import commonConfig from '@/common/config'

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
