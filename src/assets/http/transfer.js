import request from "@/tools/request";

// 根据code获取端链信息
export const codeInfo = code => {
    return request({
        url: `/v1/shorturl/${code}`
    })
}

// 预约任务状态
export const TaskInfo = (tenantId, id) => {
    return request({
        url: `/v1/subscribe/tenant/${tenantId}/visitor/task/${id}/status`
    })
}

