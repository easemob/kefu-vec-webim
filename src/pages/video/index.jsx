import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Wrapper, DefaultConnect } from './style'
import videoChatAgora from '@/tools/hxVideo'
import commonConfig from '@/common/config'
import event from '@/tools/event'
import { getOfficalAccounts } from '@/assets/http/user'
import { SYSTEM_VIDEO_TICKET_RECEIVED, SYSTEM_VIDEO_ARGO_END, SYSTEM_VIDEO_ARGO_REJECT, SYSTEM_VIDEO_CALLBACK_TICKET, SYSTEM_AGENT_CANCALCALLBACK, SYSTEM_ENQUIRY_INVITE } from '@/assets/constants/events'
import getToHost from '@/common/transfer'
import intl from 'react-intl-universal'
import utils from '@/tools/utils'
import queryString from 'query-string'
import Enquiry from './comps/Enquiry'
import Chat from './comps/Chat'
import WaitPage from './waitPage'
import CurrentPage from './currentPage'

import ws from '@/ws'

var serviceAgora = null
var top = window.top === window.self // false 在iframe里面 true不在
var config = commonConfig.getConfig()
var params = queryString.parse(location.search)
var hideDefault = params.hideDefaultButton || false
if (!top && params.hideDefaultButton === undefined) {
    hideDefault = false
}

// 沙箱打开vconsole
if (window.location.origin.indexOf('localhost') > -1 || window.location.origin.indexOf('sandbox') > -1) {
    import('vconsole').then(({default: VConsole }) => {
        new VConsole()
    })
}

export default function Video() {
    const [step, setStep] = useState(config.switch.skipWaitingPage ? 'wait' : 'start') // start: 发起和重新发起 wait等待接听中 current 视频中 invite:客服邀请 enquiry: 评价
    const [ localUser, setLocalUser ] = useState(null); // 本地用户音视频轨道保存
    const [ currentChooseUser, setCurrentChooseUser ] = useState(null); // 当前在正中央播放的用户
    const [callId, setCallId] = useState(null)
    const [idNameMap, setIdNameMap] = useState({})
    const [show, setShow] = useState(top ? true : false)
    const [hideDefaultButton] = useState(hideDefault)
    const [enquiryTimer, setEnquiryTimer] = useState(null) // 评价
    const [enquiryData, setEnquiryData] = useState({})
    const [chatVisible, setChatVisible] = useState(false) // 聊天
    const [remoteUsers, setRemoteUsers] = useState([])
    const [time, setTime] = useState(false) // 开始计时

    const waitPageRef = useRef()
    const currentPageRef = useRef()

    // 接受视频
    const recived = async ticketInfo => {
        if (!serviceAgora) {

            var cfgAgora = {
                appid: ticketInfo.appId,
                channel: ticketInfo.channel,
                token: ticketInfo.token,
                uid: ticketInfo.uid
            }
            // callId 拒绝视频邀请要用
            setCallId(ticketInfo.callId)

            serviceAgora = new videoChatAgora({
                onErrorNotify,
                onRemoteUserChange,
                onUserLeft
            })
            // 获取访客信息 关闭信息的时候要用 后续不掉用关闭接口可以去除
            const officialAccountList = await getOfficalAccounts()
            await serviceAgora.join(cfgAgora)
            setTime(true) // 开始计时
            setStep('current')

            serviceAgora.localAudioTrack.setMuted(config.switch.visitorCameraOff)
            serviceAgora.localVideoTrack.setMuted(config.switch.visitorCameraOff)
            // config.switch.visitorCameraOff && serviceAgora.closeLocalTrack('video')

            let { localAudioTrack, localVideoTrack } = serviceAgora
            let localUser = {
                isLocal: true, 
                // audioTrack: localAudioTrack,
                videoTrack: localVideoTrack,
                // videoTrack: config.switch.visitorCameraOff ? null : localVideoTrack,
                uid: cfgAgora.uid
            }

            setLocalUser(localUser);
            setCurrentChooseUser(localUser);
        }

        setIdNameMap(val => Object.assign({}, val, {[ticketInfo.agentTicket.uid]: ticketInfo.agentTicket.trueName}))
    }

    const handleClose = (e) => {
        waitPageRef.current.handleClose(e)
        currentPageRef.current.handleClose()
        setTime(false)
        setCallId(null)
        setChatVisible(false)

        // 本地离开
        serviceAgora && serviceAgora.leave();
        serviceAgora = null
    }

    const onRemoteUserChange = useCallback((remoteUsers) => {
        setRemoteUsers(remoteUsers);
    }, []);

    // 客服没接 visitorCancelInvitation 接通后就是 visitorRejectInvitation
    const onUserLeft = useCallback(user => {
        if (!serviceAgora) return

        if (!serviceAgora.remoteUsers.length) {
            handleClose()
        } else {
            let _remoteUsers = serviceAgora.remoteUsers || [];
            if (currentChooseUser && user === currentChooseUser && !!_remoteUsers.length && (_remoteUsers[0] !== user)) {
                setCurrentChooseUser(_remoteUsers[0]);
            }
        }
    }, [currentChooseUser, remoteUsers, step])

    function onErrorNotify(errorCode) {
        let errorCodeMap = {
            NOT_READABLE: '请检查摄像头/麦克风，或者屏幕分享权限！请刷新浏览器重试！',
            PERMISSION_DENIED: '请检查摄像头/麦克风，或者屏幕分享权限！',
            INVALID_REMOTE_USER: '非法的远端用户，可能是远端用户不在频道内或还未发布任何媒体轨道。',
            UNEXPECTED_RESPONSE: '等待网络稳定后重试该操作。',
            NOT_SUPPORTED: '浏览器不支持。建议使用谷歌浏览器',
            INVALID_PARAMS: '非法参数',
            INVALID_OPERATION: '非法操作，通常是因为在当前状态不能进行该操作。',
            OPERATION_ABORTED: 'OPERATION_ABORTED 操作中止，通常是因为网络质量差或连接断开导致与 Agora 服务器通信失败。',
            NO_ACTIVE_STATUS: ' Agora 项目未激活或被禁用',
            UID_CONFLICT: ' 同一个频道内 UID 重复。',
            INVALID_UINT_UID_FROM_STRING_UID: 'String UID 分配服务返回了非法的 int UID。',
            DEVICE_NOT_FOUND: "设备未找到，请检查设备"
        }
    
        errorCodeMap[errorCode] && console.error(errorCodeMap[errorCode])
    }

    // iframe最小化
    const handleMini = () => {
        getToHost.send({event: 'closeChat'})
        setShow(false)
    }

    // 默认联系客服
    const handleConnect = () => {
        getToHost.send({event: 'showChat'})
        setShow(true)
    }
    
    // 评价
    const reciveEnquiry = useCallback(enquiry => {
        if (step === 'current') {
            handleClose()
        }

        setEnquiryData(enquiry)
        setStep('enquiry')
    }, [step])

    const handleEnquiry = () => {
        setEnquiryTimer(setTimeout(() => {
            setStep('start')
            waitPageRef.current?.setDesc(intl.get('reStartVideo'))
        }, 3000))
    }

    // 聊天
    const handleChatClose = () => {
        setChatVisible(false)
    }
    
    const getChat = () => {
        return utils.isMobile ? <div style={{backgroundColor: '#000'}}><Chat close={handleChatClose} /></div> : <Chat close={handleChatClose} />
    }

    useEffect(() => {
        if (!serviceAgora?.client) return;
    
        serviceAgora.client.on('user-left', onUserLeft);
        return () => void serviceAgora?.client?.off('user-left', onUserLeft);
    }, [onUserLeft]);

    useEffect(() => {
        event.on(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
        event.on(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
        event.on(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接
        event.on(SYSTEM_VIDEO_CALLBACK_TICKET, recived) // 坐席回呼
        event.on(SYSTEM_AGENT_CANCALCALLBACK, handleClose)
        event.on(SYSTEM_ENQUIRY_INVITE, reciveEnquiry) // 邀请评价

        return () => {
            event.off(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
            event.off(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
            event.off(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接
            event.off(SYSTEM_VIDEO_CALLBACK_TICKET, recived)
            event.off(SYSTEM_AGENT_CANCALCALLBACK, handleClose)
            event.off(SYSTEM_ENQUIRY_INVITE, reciveEnquiry) // 邀请评价
        }
    }, [step])

    useEffect(() => {
        return () => {
            clearTimeout(enquiryTimer)
        }
    }, [])

    // 聊天位置
    var chatPos = 'chat_mask' // 浮层
    top && (chatPos = 'chat_half_right') // 右半屏
    utils.isMobile && (chatPos = 'chat_half_bottom') // 下半屏

    return (
        <React.Fragment>
            <Wrapper role={step} top={top} className={`${utils.isMobile ? 'full_screen' : ''} ${top || show || hideDefaultButton ? '' : 'hide'} ${chatVisible && !utils.isMobile ? chatPos : ''}`}>
                {!top && step !== 'enquiry' && <span onClick={handleMini} className={step === 'current' ? 'icon-mini' : 'icon-close'}></span>}
                <CurrentPage
                    step={step}
                    ref={currentPageRef}
                    config={config}
                    ws={ws}
                    serviceAgora={serviceAgora}
                    setStep={setStep}
                    callId={callId}
                    setCurrentChooseUser={setCurrentChooseUser}
                    remoteUsers={remoteUsers}
                    currentChooseUser={currentChooseUser}
                    time={time}
                    chatVisible={chatVisible}
                    localUser={localUser}
                    idNameMap={idNameMap}
                    setLocalUser={setLocalUser}
                    setChatVisible={setChatVisible}
                    getChat={getChat}
                    chatPos={chatPos}
                    handleCloseVideo={handleClose}
                    top={top}
                />
                {/* 等待页面 */}
                <WaitPage
                    ref={waitPageRef}
                    step={step}
                    config={config}
                    ws={ws}
                    setStep={setStep}
                    params={params}
                    serviceAgora={serviceAgora}
                    callId={callId}
                    handleCloseVideo={handleClose}
                    />
                {step === 'enquiry' && <Enquiry handleSendWs={handleEnquiry} {...enquiryData} />}
                {chatVisible && top && !utils.isMobile && getChat()}
            </Wrapper>
            <DefaultConnect onClick={handleConnect} className={hideDefaultButton || top || show ? 'hide' : ''}>
                <span className='icon-logo'>{intl.get('contact_agent')}</span>
            </DefaultConnect>
        </React.Fragment>
    )
}
