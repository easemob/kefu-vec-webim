import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react'
import { Wrapper, WaitWrapper, WaitTitle, WaitAgent, WaitAgentLogo, WaitAgentDesc, WaitTip, WaitOpera, CurrentWrapper, CurrentTitle, CurrentBody, CurrentFooter, CurrentBodySelf, CurrentBodyAgent, CurrentBodyMicro, CurrentBodyMore, TopVideoBox, CurrentVideo } from './style'
import TimeControl from './comps/TimeControl'
import videoChatAgora from '@/tools/hxVideo'
import logo from '@/assets/img/qiye.png'
import commonConfig from '@/common/config'
import event from '@/tools/event'
import { visitorClose, getOfficalAccounts } from '@/assets/http/user'
import { SYSTEM_VIDEO_TICKET_RECEIVED, SYSTEM_VIDEO_ARGO_END, SYSTEM_VIDEO_ARGO_REJECT } from '@/assets/constants/events'
import profile from '@/tools/profile'
import MediaPlayer from './comps/MediaPlayer/MediaPlayer'
import getToHost from '@/common/transfer'

import ws from '@/ws'

var serviceAgora = null
var top = window.top === window.self // false 在iframe里面 true不在

export default function Video() {
    const [step, setStep] = useState('start') // start: 发起和重新发起 wait等待接听中 current 视频中 off：挂断
    const [desc, setDesc] = useState('发起通话')
    const [tip, setTip] = useState('您好！有什么需要帮助，可以发起视频通话进行咨询呦！')
    const [sound, setSound] = useState(true) // 开关声音
    const [face, setFace] = useState(true) // 开关视频
    const [pos, setPos] = useState(true) // 默认展示自己
    const [time, setTime] = useState(false) // 开始计时
    const [agentSound, setAgentSound] = useState(true) // 客服声音
    const [compInfo, setCompInfo] = useState({})
    const [ localUser, setLocalUser ] = useState(null); // 本地用户音视频轨道保存
    const [ currentChooseUser, setCurrentChooseUser ] = useState(null); // 当前在正中央播放的用户

    const [callId, setCallId] = useState(null)
    const [remoteUsers, setRemoteUsers] = useState([])
    const [ticketInfo, setTicketIfo] = useState(null)
    const [idNameMap, setIdNameMap] = useState({})
    const [agents, setAgents] = useState([])
    const [ssid, setSsid] = useState('')

    const videoRef = useRef();
    const stepRef = useRef()

    // 发起、重新发起
    function handleStart() {
        setStep('wait')
        setDesc('挂断')
        setTip(`您好！您正在发起视频通话进行咨询。`)
        setCompInfo({
            name: commonConfig.getConfig().tenantInfo.name,
            avatar: commonConfig.getConfig().tenantInfo.avatar,
        })

        ws.sendText('邀请客服进行实时视频', {
            ext: {
                type: "agorartcmedia/video",
                targetSystem: 'kefurtc',
                msgtype: {
                    liveStreamInvitation: {
                        msg: '邀请客服进行实时视频',
                        orgName: commonConfig.getConfig().orgName,
                        appName: commonConfig.getConfig().appName,
                        userName: commonConfig.getConfig().user.username,
                        imServiceNumber: commonConfig.getConfig().toUser,
                        restServer: commonConfig.getConfig().restServer,
                        xmppServer: commonConfig.getConfig().xmppServer,
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
    const recived = useCallback(ticketInfo => {
        // agents.push(ticketInfo.agentTicket)
        setAgents(agentsOld => {
            if (!agentsOld.map(agent => agent.userId).includes(ticketInfo.agentTicket.userId)) {
                agentsOld.push(ticketInfo.agentTicket)
            }

            return agentsOld
        })
        // setAgents([...new Set(agents)])

        if (!serviceAgora) {
            setTicketIfo(ticketInfo)
            // setStep('current') // 进行中视频
    
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
                onUserLeft})
            // 获取访客信息 关闭信息的时候要用
            getOfficalAccounts().then(officialAccountList => {
                officialAccountList.forEach(ws.attemptToAppendOfficialAccount)

            	if(!profile.ctaEnable){
            		profile.currentOfficialAccount = profile.systemOfficialAccount;
            	}

                setTime(true) // 开始计时
                setStep('current')
                serviceAgora.join(cfgAgora).then(() => {
                    let { localAudioTrack, localVideoTrack } = serviceAgora
                    let localUser = { 
                        isLocal: true, 
                        // audioTrack: localAudioTrack,
                        videoTrack: localVideoTrack,
                        uid: cfgAgora.uid
                    }
          
                    setLocalUser(localUser);
                    setCurrentChooseUser(localUser);

                    // serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play('visitor_video');
                })
            }, err => {
                noVisitorClose()
            })
        }
    }, [ticketInfo, serviceAgora])

    // 无访客信息直接挂断，否则关闭需要的信息获取不到
    const noVisitorClose = () => {
        setStep('start')
        setDesc('重新发起')
        setTip('感谢您的咨询，祝您生活愉快！')
        setCallId(null)

        // 本地离开
        serviceAgora && serviceAgora.leave();
        serviceAgora = null
    }

    // 结束
    const handleClose = useCallback(() => {
        if (stepRef.current.getAttribute('role') === 'wait') {
            setStep('start')
            setDesc('重新发起')
            setTip('感谢您的咨询，祝您生活愉快！')
            setCallId(null)
            setTime(false)
            setTicketIfo(null)
            setSound(true)
            setFace(true)
            setPos(true)

            ws.sendText('访客取消实时视频', { // 防止发的消息被翻译，归类为系统消息
                ext: {
                    type: "rtcmedia/video",
                    targetSystem: 'kefurtc',
                    msgtype: {
                        visitorCancelInvitation: {
                            msg: '访客取消实时视频',
                            callId: callId,
                        },
                    },
                },
            })
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

            // 本地离开
            serviceAgora && serviceAgora.leave();
            serviceAgora = null
        } else {
            visitorClose(ssid)
            setStep('start')
            setDesc('重新发起')
            setTip('感谢您的咨询，祝您生活愉快！')
            setCallId(null)
            setTime(false)
            setTicketIfo(null)
            setSound(true)
            setFace(true)
            setPos(true)
            setSsid('')

            // 本地离开
            serviceAgora && serviceAgora.leave();
            serviceAgora = null
        }
    }, [ssid, callId])

    // 声音
    function handleSound() {
        setSound(!sound)
        serviceAgora.localAudioTrack.setMuted(sound); // false 打开 true 关闭
    }

    function handleFace() {
        setFace(!face)
        serviceAgora.localVideoTrack.setMuted(face); // false 打开 true 关闭
    }

    const onRemoteUserChange = useCallback((remoteUsers) => {
        setRemoteUsers(remoteUsers);
    }, []);

    // 客服没接 visitorCancelInvitation 接通后就是 visitorRejectInvitation
    const onUserLeft = useCallback(user => {
        if (!serviceAgora.remoteUsers.length) {
            serviceAgora.leave()
            serviceAgora = null
            setStep('start')
            setDesc('重新发起')
            setTip('感谢您的咨询，祝您生活愉快！')
            setCallId(null)
            setTime(false)
            setTicketIfo(null)
            setSound(true)
            setFace(true)
            setPos(true)

            // ws.cancelVideo(callId, {
            //     ext: {
            //         type: "agorartcmedia/video",
            //         targetSystem: 'kefurtc',
            //         msgtype: {
            //             visitorRejectInvitation: { // 客服挂断
            //                 callId: callId
            //             }
            //         },
            //     },
            // })
        } else {
            let _remoteUsers = serviceAgora.remoteUsers || [];
            if (currentChooseUser && user === currentChooseUser && !!_remoteUsers.length && (_remoteUsers[0] !== user)) {
                setCurrentChooseUser(_remoteUsers[0]);
            }
        }

        if (user && currentChooseUser) {
            // 客服名字处理
            var idx = _.findIndex(remoteUsers, user)
            if (idx > -1) {
                agents.splice(idx, 1)
                setAgents(agents)
            }
        }
    }, [currentChooseUser, remoteUsers, agents])

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

    useEffect(() => {
        if (!serviceAgora?.client) return;
    
        serviceAgora.client.on('user-left', onUserLeft);
        return () => void serviceAgora?.client?.off('user-left', onUserLeft);
    }, [onUserLeft]);

    useEffect(() => {
        if (remoteUsers.length && !currentChooseUser.isLocal) {
            currentChooseUser?.videoTrack?.play(videoRef.current);
            currentChooseUser?.audioTrack?.play();
        }

        if (remoteUsers.length) {
            var id2name = {}
            remoteUsers.forEach((user, idx) => {
                id2name[user.uid] = agents[idx] && agents[idx].trueName
            })
            setIdNameMap(id2name)
        }
    }, [remoteUsers, agents])

    useEffect(() => {
        if (!videoRef.current) return;
    
        currentChooseUser?.audioTrack?.play();
        currentChooseUser?.videoTrack?.play(videoRef.current); //本地播放视频
    }, [currentChooseUser])

    useEffect(() => {
        event.on(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
        event.on(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
        event.on(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接

        return () => {
            event.off(SYSTEM_VIDEO_TICKET_RECEIVED, recived) // 监听接受
            event.off(SYSTEM_VIDEO_ARGO_END, handleClose) // 取消和挂断
            event.off(SYSTEM_VIDEO_ARGO_REJECT, handleClose) // 坐席拒接
        }
    }, [])

    return (
        <Wrapper role={step} top={top}>
            {!top && <span onClick={handleMini} className={step === 'current' ? 'icon-mini' : 'icon-close'}></span>}
            <CurrentWrapper className={step === 'current' ? '' : 'hide'}>
                <CurrentTitle>
                    <span>{time  ? '通话中' : '等待接通中'}</span>
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
                                    ? '我' 
                                    : `客服-${idNameMap[currentChooseUser.uid] || ''}`  : ''    
                                }</span>
                            </div>
                            <div id='visitor_video' ref={videoRef}></div>
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
                    <h2>视频客服</h2>
                </WaitTitle>
                <WaitAgent>
                    <WaitAgentLogo>
                        <img src={compInfo.avatar ? compInfo.avatar : logo}  />
                    </WaitAgentLogo>
                    <WaitAgentDesc>
                        {compInfo.name ? compInfo.name : ''}
                    </WaitAgentDesc>
                </WaitAgent>
                <WaitTip>{tip}</WaitTip>
                <WaitOpera role={step} ref={stepRef}>
                    <div>
                        {
                            step === 'start' ? <span onClick={handleStart} className='icon-answer'></span> : <span onClick={handleClose} className='icon-off'></span>
                        }
                    </div>
                    <div>{desc}</div>
                </WaitOpera>
            </WaitWrapper>
        </Wrapper>
    )
}
