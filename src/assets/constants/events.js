export const SYSTEM_OFFLINE = 'system_offline'

// ws
export const HEART_BEAT_INTERVAL = 60000

// IM
export const WEBIM_CONNCTION_OPEN_ERROR = 1
export const WEBIM_CONNCTION_AUTH_ERROR = 2
export const WEBIM_CONNCTION_AJAX_ERROR = 17
export const WEBIM_CONNCTION_CALLBACK_INNER_ERROR = 31

// // 关闭 会话聊天框
export const SYSTEM_CHAT_CLOSED = 'chat.closed'
// 清除agentState定时器
export const SYSTEM_CLEAR_AGENTSTATE = 'clear.agentstate'
export const SYSTEM_CLEAR_AGENTINPUTSTATE = 'clear.agentinputstate'
// 判断是否调用历史消息
export const SYSTEM_IS_PULL_HISTORY = 'is.pull.history'

export const SYSTEM_NEW_OFFICIAL_ACCOUNT_FOUND = 'new.official.account.found'
export const SYSTEM_OFFICIAL_ACCOUNT_UPDATED = 'system.official.account.updated'

export const SYSTEM_VIDEO_TICKET_RECEIVED = 'video.ticket.received'
export const SYSTEM_VIDEO_CALLBACK_TICKET = 'video.callback.ticket'

export const SYSTEM_VIDEO_ARGO_END = 'video.argo.end' // 声网音视频结束的通知

export const SYSTEM_WHITE_BOARD_RECEIVED = 'board.received' // 电子白板的通知

export const SYSTEM_AGENT_INFO_UPDATE = 'agent.info.update' // 坐席信息修改

export const SYSTEM_EVENT_MSG_TEXT = {
    ServiceSessionCreatedEvent: '会话创建成功',
    ServiceSessionOpenedEvent: '会话已被客服接起',
    ServiceSessionTransferedToAgentQueueEvent: '会话转接中，请稍候',
    ServiceSessionTransferedEvent: '会话已被转接至其他客服',
    ServiceSessionClosedEvent: '会话已结束',
}

export const SYSTEM_SESSION_TRANSFERED = 'ServiceSessionTransferedEvent'
export const SYSTEM_SESSION_CREATED = "ServiceSessionCreatedEvent"
export const SYSTEM_SESSION_OPENED = "ServiceSessionOpenedEvent"
export const SYSTEM_SESSION_CLOSED = "ServiceSessionClosedEvent"
export const SYSTEM_SESSION_TRANSFERING = "ServiceSessionTransferedToAgentQueueEvent"

export const SYSTEM_VIDEO_ARGO_REJECT = 'agent.reject.visitor_video' // 坐席拒接

export const SESSION_STATE_PROCESSING = 'Processing'
export const SYSTEM_AGENT_CANCALCALLBACK = 'agent_cancel_callback'
export const SYSTEM_ENQUIRY_INVITE = 'enquiry_invite'
export const SYSTEM_RTCSESSION_INFO = 'rtcSession_info'

