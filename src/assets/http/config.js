import request from '@/tools/request'

export function getConfig(id) {
    return request({
        url: '/v1/webimplugin/settings/visitors/configs/' + id,
        method: 'get'
    })
}

export function getConfigOption(params) {
    return request({
        url: '/v1/webimplugin/settings/tenants/' + params.tenantId + '/configs/' + params.configId + '/fusion?page=0&size=8',
        method: 'get'
    })
}

export function getRelevanceListConfig(params) {
    return request({
        url: '/v1/webimplugin/targetChannels?tenantId=' + params.tenantId,
        method: 'get'
    })
}

export function tenantInfo(params) {
    return request({
        url: "/v1/webimplugin/tenants/" + params.tenantId + "/info",
        type: "GET",
        data: params
    })
}

