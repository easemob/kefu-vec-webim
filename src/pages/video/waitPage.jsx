import React, { useState, useRef, useImperativeHandle, useCallback, useEffect } from "react";
import TimeControl from './comps/TimeControl'
import logo from '@/assets/img/qiye.png'
import intl from 'react-intl-universal'
import event from '@/tools/event'
import { WaitWrapper, WaitTitle, WaitAgent, WaitAgentLogo, WaitAgentDesc, WaitTip, WaitOpera, InviteOpera} from './style'
import { SYSTEM_RTCSESSION_INFO, SYSTEM_VIDEO_CALLBACK } from '@/assets/constants/events'
import { visitorClose, visitorWaiting, getTicket } from '@/assets/http/user'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'

function AnswerButton({handleClick, desc, init = true}) {
    return <React.Fragment>
        <div>
            <span className={`icon-${init ? 'answer' : 'off'}`} onClick={handleClick}></span>
        </div>
        <div>{desc}</div>
    </React.Fragment>
}

function AnswerButtonNew({handleClick, desc, icon}) {
    return <React.Fragment>
        <div>
            <span className={`icon-${icon}`} onClick={handleClick}></span>
        </div>
        <div>{desc}</div>
    </React.Fragment>
}

export default React.forwardRef(function({step, config, ws, setStep, params, callId, serviceAgora, handleCloseVideo, recived }, ref) {
    const [desc, setDesc] = useState(intl.get('startVideo'))
    const [tip, setTip] = useState(config.style.waitingPrompt)
    const [timer, setTimer] = useState(null)
    const [sessionInfo, setSessionInfo] = useState({})
    const [waitTimer, setWaitTimer] = useState(null) // 排队
    const [waitTimerFlag, setWaitTimerFlag] = useState('true')
    const [compInfo] = useState({
        name: config.tenantInfo.name,
        avatar: config.tenantInfo.avatar,
    })

    const stepRef = useRef()
    let navigate = useNavigate()

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
        handleCloseVideo()
    }

    // 发起、重新发起
    function handleStart() {
        setStep('wait')
        setDesc(intl.get('closeVideo'))
        setTip(config.style.callingPrompt)

        setTimer(setTimeout(() => {
            var ext = {
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
                }
            }
            if (params.source) {
                // source: 一键邀请invitation 预约subscribe
                ext.sessionExt = {
                    source: params.source,
                    taskId: params.taskId || '',
                    queueId: Number(params.queueId) || 0,
                    agentUserId: params.agentUserId,
                    inviteeVisitorName: params.inviteeVisitorName
                }
            }
            // 非预约任务去除sessionExt，防止访客插队
            typeof config.isReserveTask !== 'undefined' && !config.isReserveTask && (delete ext['sessionExt'])
            ws.sendText(intl.get('inviteAgentVideo'), {
                ext
            })
        }, 1000))
    }

    // 结束 1.访客等待挂断 2.访客接通挂断 3.坐席拒接
    const handleClose = useCallback(e => {
        if (serviceAgora && !serviceAgora.remoteUsers.length) {
            // 坐席挂断
        } else {
            if (step === 'wait' && e && !e.agentReject) { // e: ws时是自定义消息，其他就是event
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
                visitorClose(sessionInfo.rtcSessionId, sessionInfo.visitorUserId)
            }
        }

        setStep('start')
        setDesc(intl.get('reStartVideo'))
        setTip(config.style.endingPrompt)
        setSessionInfo({})
    }, [sessionInfo, step, callId])

    useImperativeHandle(ref, () => ({
        handleClose,
        setDesc,
        setTip
    }), [step, callId])

    // 会话信息&&排队
    const receiveRtcSession = sInfo => {
        setSessionInfo(sInfo)
        // callType  视频类型，呼入: 0，呼出: 1, 只有呼入才会调用查询排队人数接口
        if (sInfo.callType === 0) {
            setWaitTimer(setInterval(() => {
                getWaitData(sInfo.tenantId, sInfo.rtcSessionId)
            }, 3000))
        }
    }

    const getWaitData = (tenantId, ssid) => {
        visitorWaiting(tenantId, ssid).then(({entity: {waitingFlag, visitorWaitingNumber}}) => {
            stepRef.current.getAttribute('role') === 'wait' && setTip(visitorWaitingNumber)
            setWaitTimerFlag(waitingFlag)
        })
    }

    // 坐席回呼
    const agentCallback = callbackInfo => {
        setStep('invite')
        setTip('客服正在邀请您进行视频通话')
    }

    // 重新预约
    const handleReserve = () => {
        navigate(`../reserve?tenantId=${config.tenantId}`)
    }

    // 加入当前通话
    const handleAddCurrent = async () => {
        let extra = JSON.parse(params.extra)
        const ticket = await getTicket(params.visitorId, params.sessionId)
        if (ticket.status && ticket.status === 'OK') {
            recived(Object.assign({}, ticket.entity.visitorTicket, {agentTicket: ticket.entity.agentTicket}))
        } else {
            delete params.businessType
            Toast.show({
                icon: 'fail',
                content: '通话不存在'
            })
            setTip(`${extra.inviteeVisitorName || ''}您好，${extra.creatorName || ''}邀请您加入视频通话，如您需要请点击加入发起通话！`)
        }
    }

    // 操作按钮
    const getOperaButton = () => {
        if (step === 'invite') {
            return <InviteOpera>
                <div className='recive'>
                    <AnswerButton
                        handleClick={callbackRecived}
                        desc={intl.get('reciveVideo')}/>
                </div>
                <div className='hung'>
                    <AnswerButton
                        handleClick={callbackReject}
                        desc={intl.get('closeVideo')}
                        init={false}/>
                </div>
            </InviteOpera>
        } else if (params.businessType === 'SubscribeTask-Vec') { // 预约服务
            return <InviteOpera role={step} ref={stepRef}>
                <div className='recive'>
                    <AnswerButtonNew
                        handleClick={handleReserve}
                        desc={'重新预约'}
                        icon='reserve' />
                </div>
                {step === 'start' ? <div className='reserve'>
                    <AnswerButton
                        handleClick={handleStart}
                        desc={config.isReserveTask ? '预约通话' : '非预约通话'}
                    />
                </div> : <div className='hung'>
                    <AnswerButton
                        handleClick={handleCloseVideo}
                        desc={desc}
                        init={false} />
                </div>}
            </InviteOpera>
        } else if (params.businessType === 'MultiInvitation-Vec') { // 邀请多方通话
            return <WaitOpera role={step} ref={stepRef}>
                {step === 'start' ? (
                    params.sessionId ? <AnswerButtonNew handleClick={handleAddCurrent} desc={'加入通话'} icon='join-video' /> : <AnswerButton handleClick={handleStart} desc={desc} />
                ) : <AnswerButton handleClick={handleCloseVideo} desc={desc} init={false} />}
            </WaitOpera>
        }

        return <WaitOpera role={step} ref={stepRef}>
            {step === 'start' ? <AnswerButton handleClick={handleStart} desc={desc} /> : <AnswerButton handleClick={handleCloseVideo} desc={desc} init={false} />}
        </WaitOpera>
    }

    useEffect(() => {
        if (waitTimerFlag !== 'true') {
            clearInterval(waitTimer)
            setWaitTimerFlag('true')
        }
    }, [waitTimerFlag, waitTimer])

    useEffect(() => {
        event.on(SYSTEM_RTCSESSION_INFO, receiveRtcSession) // 会话信息，开始排队
        event.on(SYSTEM_VIDEO_CALLBACK, agentCallback) // 回呼

        return () => {
            event.off(SYSTEM_RTCSESSION_INFO, receiveRtcSession)
            event.off(SYSTEM_VIDEO_CALLBACK, agentCallback) // 回呼
        }
    }, [step])

    useEffect(() => {
        // 直接发起视频通话
        if (config.switch.skipWaitingPage) {
            handleStart()
        }

        return () => {
            clearTimeout(timer)
            clearTimeout(waitTimer)
        }
    }, [])

    var waitTitle = step === 'invite' ? intl.get('inviteTitle') : intl.get('ptitle')
    var tenantLogo = logo // 头像含有域名展示不出来
    if (compInfo.avatar) {
        tenantLogo = compInfo.avatar.indexOf('//') > -1 ? '/' + compInfo.avatar.split('/').slice(3).join('/') : compInfo.avatar
    }

    return <WaitWrapper className={!['enquiry', 'current'].includes(step) ? '' : 'hide'}>
        <WaitTitle>
            <h2>{waitTitle}</h2>
        </WaitTitle>
        <WaitAgent>
            {step === 'invite' && <TimeControl />}
            <WaitAgentLogo>
                <img src={tenantLogo}  />
            </WaitAgentLogo>
            <WaitAgentDesc>
                {compInfo.name ? compInfo.name : ''}
            </WaitAgentDesc>
        </WaitAgent>
        <WaitTip>{tip}</WaitTip>
        {getOperaButton()}
    </WaitWrapper>
})