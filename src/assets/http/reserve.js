import request from "../../tools/request";

// 获取验证码
export const sendCode = (tenantId, phone) => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/sendSmsVerifyCode?phone=${encodeURIComponent(phone)}`,
        method: 'POST'
    })
}

// 登录
export const userLoginWithCode = (tenantId, phone, verifyCode) => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/login`,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            phone,
            verifyCode
        })
    })
}

// 退出
export const userLogout = (tenantId, userId, token) => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/${userId}/logout`,
        method: 'POST',
        headers: {token}
    })
}

// 业务列表
export const businessList = tenantId => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/business/type?page=0&size=100`,
        method: 'get'
    })
}

// 最近7天日历
export const sevenDays = (tenantId, date) => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/calendar?fromDate=${date}`,
        method: 'get'
    })
}

// 剩余资源
export const restBusiness = (tenantId, businessId, subscribeDate) => {
    subscribeDate += ' 00:00:00'

    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/business/${businessId}/resource/surplus-number`,
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        data: JSON.stringify({
            subscribeDate
        })
    })
}

// 创建预约
export const createTask = data => {
    return request({
        url: `/v1/subscribe/tenant/${data.tenantId}/visitor/${data.creatorId}/business/${data.businessId}/task`,
        method: 'POST',
        headers: {token: data.token, 'Content-Type': 'application/json'},
        data: JSON.stringify(data)
    })
}

// 预约记录
export const reserveList = data => {
    return request({
        url: `/v1/subscribe/tenant/${data.tenantId}/visitor/${data.creatorId}/task/list`,
        method: 'POST',
        headers: {token: data.token, 'Content-Type': 'application/json'},
        data: JSON.stringify({
            creatorId: data.creatorId,
            page: data.page,
            size: 10
        })
    })
}

// 取消预约
export const cancelMask = data => {
    return request({
        url: `/v1/subscribe/tenant/${data.tenantId}/visitor/${data.creatorId}/task/${data.id}`,
        method: 'DELETE',
        headers: {token: data.token}
    })
}
