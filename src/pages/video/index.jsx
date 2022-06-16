import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Wrapper, WaitWrapper, WaitTitle, WaitAgent, WaitAgentLogo, WaitAgentDesc, WaitTip, WaitOpera, CurrentWrapper, CurrentTitle, CurrentFooter, CurrentBodySelf, CurrentBodyMicro, CurrentBodyMore, TopVideoBox, CurrentVideo, InviteOpera } from './style'
import TimeControl from './comps/TimeControl'
import videoChatAgora from '@/tools/hxVideo'
import logo from '@/assets/img/qiye.png'
import commonConfig from '@/common/config'
import event from '@/tools/event'
import { visitorClose, getOfficalAccounts } from '@/assets/http/user'
import { SYSTEM_VIDEO_TICKET_RECEIVED, SYSTEM_VIDEO_ARGO_END, SYSTEM_VIDEO_ARGO_REJECT, SYSTEM_VIDEO_CALLBACK_TICKET } from '@/assets/constants/events'
// import profile from '@/tools/profile'
import MediaPlayer from './comps/MediaPlayer/MediaPlayer'
import getToHost from '@/common/transfer'
import intl from 'react-intl-universal'
import utils from '@/tools/utils'

import ws from '@/ws'

var serviceAgora = null
var top = window.top === window.self // false 在iframe里面 true不在
var config = commonConfig.getConfig()

// 沙箱打开vconsole
if (window.location.origin.indexOf('localhost') > -1 || window.location.origin.indexOf('sandbox') > -1) {
    import('vconsole').then(({default: VConsole }) => {
        new VConsole()
    })
}

export default function Video() {
    const [step, setStep] = useState(config.switch.skipWaitingPage ? 'wait' : 'start') // start: 发起和重新发起 wait等待接听中 current 视频中 off：挂断 invite:客服邀请
    const [desc, setDesc] = useState(intl.get('startVideo'))
    const [tip, setTip] = useState(config.style.waitingPrompt)
    const [sound, setSound] = useState(!config.switch.visitorCameraOff) // 开关声音
    const [face, setFace] = useState(!config.switch.visitorCameraOff) // 开关视频
    const [time, setTime] = useState(false) // 开始计时
    const [compInfo, setCompInfo] = useState({
        name: config.tenantInfo.name,
        avatar: config.tenantInfo.avatar,
    })
    const [ localUser, setLocalUser ] = useState(null); // 本地用户音视频轨道保存
    const [ currentChooseUser, setCurrentChooseUser ] = useState(null); // 当前在正中央播放的用户

    const [callId, setCallId] = useState(null)
    const [remoteUsers, setRemoteUsers] = useState([])
    const [ticketInfo, setTicketIfo] = useState(null)
    const [idNameMap, setIdNameMap] = useState({})
    const [agents, setAgents] = useState({})
    const [ssid, setSsid] = useState('')

    const videoRef = useRef();
    const stepRef = useRef()

    // 发起、重新发起
    function handleStart() {
        setStep('wait')
        setDesc(intl.get('closeVideo'))
        setTip(config.style.callingPrompt)

        ws.sendText(intl.get('inviteAgentVideo'), {
            ext: {
                type: "agorartcmedia/video",
                targetSystem: 'kefurtc',
                msgtype: {
                    liveStreamInvitation: {
                        msg: intl.get('inviteAgentVideo'),
                        orgName: config.orgName,
                        appName: config.appName,
                        userName: config.user.username,
                        imServiceNumber: config.toUser,
                        restServer: config.restServer,
                        xmppServer: config.xmppServer,
                        resource: "webim",
                        isNewInvitation: true,
                        userAgent: navigator.userAgent,
                    },
                },
            },
        }
        )
    }

    // 接受视频
    const recived = async ticketInfo => {
        if (!serviceAgora) {
            setTicketIfo(ticketInfo)

            var cfgAgora = {
                appid: ticketInfo.appId,
                channel: ticketInfo.channel,
                token: ticketInfo.token,
                uid: ticketInfo.uid
            }
            // callId 拒绝视频邀请要用
            setCallId(ticketInfo.callId)
            setSsid(ticketInfo.ssid)

            serviceAgora = new videoChatAgora({
                onErrorNotify,
                onRemoteUserChange,
                onUserLeft
            })
            // 获取访客信息 关闭信息的时候要用 后续不掉用关闭接口可以去除
            const officialAccountList = await getOfficalAccounts()
            if (officialAccountList.length >= 0) {
                await serviceAgora.join(cfgAgora)
                setTime(true) // 开始计时
                setStep('current')

                serviceAgora.localAudioTrack.setMuted(config.switch.visitorCameraOff)
                serviceAgora.localVideoTrack.setMuted(config.switch.visitorCameraOff)
                config.switch.visitorCameraOff && serviceAgora.closeLocalTrack('video')

                let { localAudioTrack, localVideoTrack } = serviceAgora
                let localUser = {
                    isLocal: true, 
                    // audioTrack: localAudioTrack,
                    videoTrack: config.switch.visitorCameraOff ? null : localVideoTrack,
                    uid: cfgAgora.uid
                }

                setLocalUser(localUser);
                setCurrentChooseUser(localUser);
            } else {
                noVisitorClose()
            }
        }

        // setAgents(agentsOld => {
        //     return Object.assign({}, agentsOld, {[ticketInfo.agentTicket.uid]: ticketInfo.agentTicket})
        // })
        setIdNameMap(val => Object.assign({}, val, {[ticketInfo.agentTicket.uid]: ticketInfo.agentTicket.trueName}))
    }

    // 无访客信息直接挂断，否则关闭需要的信息获取不到
    const noVisitorClose = () => {
        setStep('start')
        setDesc(intl.get('reStartVideo'))
        setTip(config.style.endingPrompt)
        setCallId(null)

        // 本地离开
        serviceAgora && serviceAgora.leave();
        serviceAgora = null
    }

    // 结束 1.访客等待挂断 2.访客接通挂断 3.坐席拒接
    const handleClose = useCallback(e => {
        if (step === 'wait' && e && !e.agentReject) {
            ws.cancelVideo(callId, {
                ext: {
                    type: "agorartcmedia/video",
                    targetSystem: 'kefurtc',
                    msgtype: {
                        visitorCancelInvitation : {
                            callId: callId
                        }
                    },
                },
            })
        } else if (step === 'current') {
            visitorClose(ssid)
        }

        setStep('start')
        setDesc(intl.get('reStartVideo'))
        setTip(config.style.endingPrompt)
        setCallId(null)
        setTime(false)
        setTicketIfo(null)
        setSound(!config.switch.visitorCameraOff)
        setFace(!config.switch.visitorCameraOff)
        setSsid('')

        // 本地离开
        serviceAgora && serviceAgora.leave();
        serviceAgora = null
    }, [ssid, callId, step])

    // 声音
    function handleSound() {
        setSound(!sound)
        serviceAgora.localAudioTrack.setMuted(sound); // false 打开 true 关闭
    }

    const handleFace = async () => {
        if (serviceAgora.localVideoTrack) {
            serviceAgora.closeLocalTrack('video')
            setLocalUser(user => {
                user.videoTrack = null
                return user
            })
        } else {
            const localVideoTrack = await serviceAgora.createLocalVideoTrack()
            serviceAgora.publish(localVideoTrack)
            setLocalUser(user => {
                user.videoTrack = localVideoTrack
                return user
            })
            currentChooseUser.uid === localUser.uid && localVideoTrack.play(videoRef.current)
        }
        // serviceAgora.localVideoTrack.setMuted(face); // false 打开 true 关闭
        setFace(!face)
    }

    const onRemoteUserChange = useCallback((remoteUsers) => {
        setRemoteUsers(remoteUsers);
    }, []);

    // 客服没接 visitorCancelInvitation 接通后就是 visitorRejectInvitation
    const onUserLeft = useCallback(user => {
        if (!serviceAgora) return

        if (!serviceAgora.remoteUsers.length) {
            serviceAgora.leave()
            serviceAgora = null
            setStep('start')
            setDesc(intl.get('reStartVideo'))
            setTip(config.style.endingPrompt)
            setCallId(null)
            setTime(false)
            setTicketIfo(null)
            setSound(!config.switch.visitorCameraOff)
            setFace(!config.switch.visitorCameraOff)
        } else {
            let _remoteUsers = serviceAgora.remoteUsers || [];
            if (currentChooseUser && user === currentChooseUser && !!_remoteUsers.length && (_remoteUsers[0] !== user)) {
                setCurrentChooseUser(_remoteUsers[0]);
            }
        }
    }, [currentChooseUser, remoteUsers])

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
    }

    // 坐席回呼
    const agentCallback = ticketInfo => {
        setTicketIfo(ticketInfo)
        setStep('invite')
        setTip('客服正在邀请您进行视频通话')
    }

    const callbackRecived = () => {
        ws.cancelVideo(null, {
            ext: {
                type: "agorartcmedia/video",
                targetSystem: 'kefurtc',
                msgtype: {
                    visitorAcceptInvitation : {
                        msg: "访客接受视频邀请"
                    }
                },
            },
        })
        recived(ticketInfo)
    }

    const callbackReject = () => {
        ws.cancelVideo(null, {
            ext: {
                type: "agorartcmedia/video",
                targetSystem: 'kefurtc',
                msgtype: {
                    visitorRejectInvitation : {
                        msg: "访访客拒绝视频邀请"
                    }
                },
            },
        })
        handleClose()
    }

    useEffect(() => {
        if (!serviceAgora?.client) return;
    
        serviceAgora.client.on('user-left', onUserLeft);
        return () => void serviceAgora?.client?.off('user-left', onUserLeft);
    }, [onUserLeft]);

    useEffect(() => {
        // 客服在中心
        if (remoteUsers.length) {
            var agentAll = remoteUsers.filter(({uid}) => uid !== localUser.uid)
            agentAll.length && setCurrentChooseUser(agentAll[0])
        }

        if (remoteUsers.length && !currentChooseUser.isLocal) {
            currentChooseUser?.videoTrack?.play(videoRef.current, {fit: "contain"});
            currentChooseUser?.audioTrack?.play();
        }
    }, [remoteUsers])

    useEffect(() => {
        if (!videoRef.current) return;
    
        currentChooseUser?.audioTrack?.play();
        currentChooseUser?.videoTrack?.play(videoRef.current, !currentChooseUser.isLocal ? {fit: "contain"} : null); //本地播放视频
    }, [currentChooseUser])

    useEffect(() => {
        event.on(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
        event.on(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
        event.on(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接
        event.on(SYSTEM_VIDEO_CALLBACK_TICKET, agentCallback) // 坐席回呼

        return () => {
            event.off(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
            event.off(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
            event.off(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接
            event.off(SYSTEM_VIDEO_CALLBACK_TICKET, agentCallback)
        }
    }, [step])

    useEffect(() => {
        // 直接发起视频通话
        if (config.switch.skipWaitingPage) {
            handleStart()
        }
    }, [])

    var waitTitle = step === 'invite' ? intl.get('inviteTitle') : intl.get('ptitle')

    return (
        <Wrapper role={step} top={top} className={utils.isMobile ? 'full_screen' : null}>
            {!top && <span onClick={handleMini} className={step === 'current' ? 'icon-mini' : 'icon-close'}></span>}
            <CurrentWrapper className={step === 'current' ? '' : 'hide'}>
                <CurrentTitle>
                    <span>{time  ? intl.get('calling') : intl.get('waitCalling')}</span>
                    {time ? <TimeControl /> : ''}
                </CurrentTitle>
                <CurrentBodyMore>
                    <TopVideoBox className='top'>
                        {
                            step === 'current' && !!currentChooseUser && remoteUsers
                            .concat(localUser || [])
                            .filter(({ uid }) => uid !== currentChooseUser?.uid)
                            .map((user) => {
                                let { isLocal = false, uid, videoTrack, hasAudio, audioTrack } = user;

                            return <MediaPlayer
                                bindClick={() => setCurrentChooseUser(user)}
                                key={uid} 
                                isLocal={isLocal}
                                name={idNameMap[uid] || ''} 
                                hasAudio={isLocal ? sound : hasAudio}
                                audioTrack={audioTrack} 
                                videoTrack={videoTrack} 
                                />
                            })
                        }
                    </TopVideoBox>
                    <CurrentVideo>
                        {step === 'current' && currentChooseUser && (<CurrentBodySelf>
                            <div className='info'>
                                <CurrentBodyMicro className='self'>
                                    <span className={(currentChooseUser.isLocal ? sound : currentChooseUser.hasAudio) ? 'icon-microphone' : 'icon-microphone-close'}></span>
                                </CurrentBodyMicro>
                                <span>{
                                    currentChooseUser ?  currentChooseUser.isLocal 
                                    ? intl.get('me') 
                                    : `${intl.get('agent')}-${idNameMap[currentChooseUser.uid] || ''}`  : ''    
                                }</span>
                            </div>
                            <div id='visitor_video' ref={videoRef}></div>
                            <span className='icon-smile'></span>
                        </CurrentBodySelf>)}
                    </CurrentVideo>
                </CurrentBodyMore>
                <CurrentFooter top={top}>
                    <div onClick={handleSound}><span className={sound ? 'icon-sound' : 'icon-sound-close'}></span></div>
                    <div onClick={handleFace}><span className={face ? 'icon-face' : 'icon-face-close'}></span></div>
                    <div onClick={handleClose}><span className='icon-off'></span></div>
                </CurrentFooter>
            </CurrentWrapper>
            {/* 等待页面 */}
            <WaitWrapper className={step !== 'current' ? '' : 'hide'}>
                <WaitTitle>
                    <h2>{waitTitle}</h2>
                </WaitTitle>
                <WaitAgent>
                    {step === 'invite' && <TimeControl />}
                    <WaitAgentLogo>
                        <img src={compInfo.avatar ? compInfo.avatar : logo}  />
                    </WaitAgentLogo>
                    <WaitAgentDesc>
                        {compInfo.name ? compInfo.name : ''}
                    </WaitAgentDesc>
                </WaitAgent>
                <WaitTip>{tip}</WaitTip>
                {step === 'invite' ? (
                    <InviteOpera>
                        <div className='recive'>
                            <div>
                                <span className='icon-answer' onClick={callbackRecived}></span>
                            </div>
                            <div>{intl.get('reciveVideo')}</div>
                        </div>
                        <div className='hung'>
                            <div>
                                <span className='icon-off' onClick={callbackReject}></span>
                            </div>
                            <div>{intl.get('closeVideo')}</div>
                        </div>
                    </InviteOpera>
                ) : (
                    <WaitOpera role={step} ref={stepRef}>
                        <div>
                            {
                                step === 'start' ? <span onClick={handleStart} className='icon-answer'></span> : <span onClick={handleClose} className='icon-off'></span>
                            }
                        </div>
                        <div>{desc}</div>
                    </WaitOpera>
                )}
            </WaitWrapper>
        </Wrapper>
    )
}
