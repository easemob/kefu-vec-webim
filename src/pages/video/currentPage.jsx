import React, { useEffect, useState, useCallback, useImperativeHandle, useRef } from "react";
import { CurrentWrapper, CurrentTitle, CurrentFooter, CurrentBodySelf, CurrentBodyMicro, CurrentBodyMore, TopVideoBox, CurrentVideo, VideoBox } from './style'
import { SYSTEM_WHITE_BOARD_RECEIVED } from '@/assets/constants/events'
import TimeControl from './comps/TimeControl'
import MediaPlayer from './comps/MediaPlayer/MediaPlayer'
import WhiteboardPlayer from './comps/WhiteboardPlayer'
import WhiteBoard from './comps/Whiteboard'
import { Badge } from 'antd-mobile'
import intl from 'react-intl-universal'
import utils from '@/tools/utils'
import event from '@/tools/event'

export default React.forwardRef(function({step, config, serviceAgora, callId,setCurrentChooseUser, remoteUsers, currentChooseUser, ws, time, chatVisible, localUser, idNameMap, setLocalUser, setChatVisible, getChat, chatPos, handleCloseVideo, top }, ref) {
    const [sound, setSound] = useState(!config.switch.visitorCameraOff) // 开关声音
    const [face, setFace] = useState(!config.switch.visitorCameraOff) // 开关视频
    const [whiteboardUser, setWhiteboardUser] = useState(null);
    const [whiteboardVisible, setWhiteboardVisible] = useState(false);
    const [whiteboardRoomInfo, setWhiteboardRoomInfo] = useState(null);
    let [ callingScreenSwitch, setCallingScreenSwitch ] = useState(false);
    const [chatUnread, setChatUnread] = useState(null)

    const videoRef = useRef();

    const handleClose = () => {
        setSound(!config.switch.visitorCameraOff)
        setFace(!config.switch.visitorCameraOff)
        /* 重置白板信息 */
        setWhiteboardUser(null);
        setWhiteboardRoomInfo(null);
        setWhiteboardVisible(false);
    }

    useImperativeHandle(ref, () => ({
        handleClose
    }), [])

    // 声音
    function handleSound() {
        setSound(!sound)
        serviceAgora.localAudioTrack.setMuted(sound); // false 打开 true 关闭
    }

    const handleFace = async () => {
        if (callingScreenSwitch) return onDesktopControl();

        // if (serviceAgora.localVideoTrack) {
        //     serviceAgora.closeLocalTrack('video')
        //     setLocalUser(user => {
        //         user.videoTrack = null
        //         return user
        //     })
        // } else {
        //     const localVideoTrack = await serviceAgora.createLocalVideoTrack()
        //     serviceAgora.publish(localVideoTrack)
        //     setLocalUser(user => {
        //         user.videoTrack = localVideoTrack
        //         return user
        //     })
        //     currentChooseUser.uid === localUser.uid && localVideoTrack.play(videoRef.current)
        // }
        serviceAgora.localVideoTrack.setMuted(face); // false 打开 true 关闭
        setFace(!face)
    }

    // 接受白板
    const receiveWhiteBoard = roomInfo => {
        setWhiteboardRoomInfo(roomInfo)
        setWhiteboardVisible(true)
    }

    /*打开白版 */
    const showWhiteboard = () => {
        let user = {
            isWhiteboard: true,
            uid: String(Math.ceil(Math.random() * 1000))
        };
        setWhiteboardUser(user)
        setCurrentChooseUser(user);
    }

    // 关闭白板
    const handleWhiteOk = () => {
        setWhiteboardVisible(false)
    }

    /* 发送白板邀请 */
    const sendWhiteboardInvitation = useCallback(() => {
        ws.cancelVideo(callId, {
            ext: {
                type: "agorartcmedia/video",
                targetSystem: 'kefurtc',
                msgtype: {
                    whiteboardInvitaion:{
                        callId: callId
                    }
                },
            },
        });
    }, [callId])

    /* 通话中打开白板 */
    const bindWhiteboardClick = useCallback(_.debounce(async () => {
        if (whiteboardVisible) {
            return setWhiteboardVisible(false); // 关闭白版
        } else {
            sendWhiteboardInvitation(); 
        }
    }, 1000), [whiteboardVisible, callId]);

    const onUserJoined = useCallback((user) => {
        !!whiteboardRoomInfo && sendWhiteboardInvitation();
    }, [whiteboardRoomInfo]);

    /* 桌面分享绑定事件 */
    const onDesktopControl = _.debounce(function() {
        if (whiteboardVisible) return;
        let _hxAgoraVideo = serviceAgora

        if (callingScreenSwitch) {
            setFace(true);
            setCallingScreenSwitch(false);
            _hxAgoraVideo.client.unpublish(_hxAgoraVideo.localScreenTrack);
            _hxAgoraVideo.localScreenTrack?.off('track-ended')
            _hxAgoraVideo.closeLocalTrack('screen'); //关闭屏幕分享

            _hxAgoraVideo.publish(_hxAgoraVideo.localVideoTrack);
            _hxAgoraVideo.localVideoTrack.setMuted(false);
            let user = { ...localUser, videoTrack:  _hxAgoraVideo.localVideoTrack };
            setLocalUser(user);
            currentChooseUser.isLocal && setCurrentChooseUser(user);
        } else {
            _hxAgoraVideo.createScreenVideoTrack()
            .then((localScreenTrack) => {
                if (!localScreenTrack) return;
                setCallingScreenSwitch(true);
                setFace(false);

                _hxAgoraVideo.client.unpublish(_hxAgoraVideo.localVideoTrack);
                _hxAgoraVideo.localVideoTrack.stop();
                _hxAgoraVideo.publish(localScreenTrack);
                let user = { ...localUser, videoTrack:  localScreenTrack };
                setLocalUser(user);
                currentChooseUser.isLocal && setCurrentChooseUser(user);
            })
        }
    }, 1000);

    useEffect(() => {
        if (!serviceAgora?.localScreenTrack) return;

        /* 用户通过浏览器提供的关系屏幕共享按钮 */
        serviceAgora.localScreenTrack.removeAllListeners('track-ended')
        serviceAgora.localScreenTrack.on('track-ended', onDesktopControl)
    }, [callingScreenSwitch]);

    useEffect(() => {
        if (!serviceAgora?.client) return;

        serviceAgora.client.on('user-joined', onUserJoined);
        return () => void serviceAgora?.client?.off('user-joined', onUserJoined);
    }, [onUserJoined]);

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
        if (step !== 'current') return;

        if (whiteboardVisible) { //打开
            showWhiteboard();
        } else { //关闭
            setWhiteboardRoomInfo(null);
            setWhiteboardUser(null);
            if (currentChooseUser?.isWhiteboard) {
                setCurrentChooseUser(remoteUsers[0] || localUser);
            }
        }
    }, [whiteboardVisible, step])

    useEffect(() => {
        if (currentChooseUser?.isWhiteboard && whiteboardVisible) {
            setWhiteboardRoomInfo((val) => ({ ...val, domNode: videoRef.current }));
        }

        if (!videoRef.current) return;

        currentChooseUser?.audioTrack?.play();
        currentChooseUser?.videoTrack?.play(videoRef.current, !currentChooseUser.isLocal ? {fit: "contain"} : null); //本地播放视频
    }, [currentChooseUser, whiteboardVisible])

    useEffect(() => {
        event.on(SYSTEM_WHITE_BOARD_RECEIVED, receiveWhiteBoard) // 白板

        return () => {
            event.off(SYSTEM_WHITE_BOARD_RECEIVED, receiveWhiteBoard)
        }
    }, [step])

    let videoLinking = step === 'current' && !!remoteUsers.length; //通话中 有其他人加入
    var isDisabledWhiteboard = !videoLinking || callingScreenSwitch || whiteboardVisible;
    
    return <CurrentWrapper className={step === 'current' ? '' : 'hide'}>
        <CurrentTitle>
            <span>{time ? intl.get('calling') : intl.get('waitCalling')}</span>
            {time ? <TimeControl /> : ''}
        </CurrentTitle>
        <CurrentBodyMore className={chatVisible ? chatPos : ''}>
            <VideoBox>
                <TopVideoBox className='top'>
                    {
                        step === 'current' && !!currentChooseUser && remoteUsers
                        .concat(whiteboardUser || [])
                        .concat(localUser || [])
                        .filter(({ uid }) => uid !== currentChooseUser?.uid)
                        .map((user) => {
                            let {isWhiteboard = false, isLocal = false, uid, videoTrack, hasAudio, audioTrack } = user;

                        return isWhiteboard 
                        ? <WhiteboardPlayer 
                            key={uid} 
                            setWhiteboardRoomInfo={setWhiteboardRoomInfo}
                            bindClick={() => setCurrentChooseUser(user)}
                        />
                        : <MediaPlayer
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
                    {step === 'current' && currentChooseUser && (<CurrentBodySelf isMobile={utils.isMobile}>
                        {!currentChooseUser.isWhiteboard && <div className='info'>
                            <CurrentBodyMicro className='self'>
                                <span className={(currentChooseUser.isLocal ? sound : currentChooseUser.hasAudio) ? 'icon-microphone' : 'icon-microphone-close'}></span>
                            </CurrentBodyMicro>
                            <span>{
                                currentChooseUser ?  currentChooseUser.isLocal 
                                ? intl.get('me') 
                                : `${intl.get('agent')}-${idNameMap[currentChooseUser.uid] || ''}`  : ''    
                            }</span>
                            </div>}
                        <div id='visitor_video' ref={videoRef}>
                            {whiteboardVisible && <WhiteBoard 
                                whiteboardRoomInfo={whiteboardRoomInfo}
                                whiteboardUser={whiteboardUser}
                                whiteboardVisible={whiteboardVisible}
                                callId={callId}
                                domNode={videoRef.current}
                                handleClose={handleWhiteOk}
                            />}
                        </div>
                        {!currentChooseUser.videoTrack && <span className='icon-smile'></span>}
                    </CurrentBodySelf>)}
                </CurrentVideo>
            </VideoBox>
            {chatVisible && (utils.isMobile || !top) && getChat()}
        </CurrentBodyMore>
        <CurrentFooter top={top}>
            <div onClick={handleSound}>
                <span className={sound ? 'icon-sound' : 'icon-sound-close'}></span>
            </div>
            <div onClick={handleFace}>
                <span className={face ? 'icon-face' : 'icon-face-close'}></span>
            </div>
            {!utils.isMobile && top && <div onClick={onDesktopControl}>
                <span className={`icon-desktop-share ${whiteboardVisible ? 'gray' : ''}`}></span>
            </div>}
            <div onClick={() => void (!isDisabledWhiteboard && bindWhiteboardClick())}>
                <span className={`icon-white-board ${isDisabledWhiteboard  ? 'gray' : ''}`}></span>
            </div>
            <Badge content={chatUnread}>
                <div onClick={() => setChatVisible(!chatVisible)}>
                    <span className='icon-chat-button'></span>
                </div>
            </Badge>
            <div onClick={handleCloseVideo}>
                <span className='icon-off'></span>
            </div>
        </CurrentFooter>
    </CurrentWrapper>
})
