import React, {useState} from "react"
import { createPortal } from 'react-dom'
import { useFastboard, Fastboard } from "@netless/fastboard-react"
import { RoomWhite, RoomControllerBox, RoomControllerMidBox, PagePreviewCell } from './style'
import intl from 'react-intl-universal'
import Upload from 'rc-upload'
import { Modal } from 'antd-mobile'
import commonConfig from '@/common/config'
import exitSvg from '@/assets/img/exit.svg'
import imageSvg from '@/assets/img/image.svg'
import videoSvg from '@/assets/img/video.svg'
import audioSvg from '@/assets/img/audio.svg'

var config = commonConfig.getConfig()

export default function WhiteBoard({whiteboardRoomInfo, whiteboardUser, callId, domNode, handleClose}) {
    const fastboard = useFastboard(() => ({
        sdkConfig: {
            appIdentifier: whiteboardRoomInfo.appIdentifier,
            region: "cn-hz", // "cn-hz" | "us-sv" | "sg" | "in-mum" | "gb-lon"
        },
        joinRoom: {
            uid: whiteboardUser && whiteboardUser.uid || Math.ceil(Math.random() * 1000) + '',
            uuid: whiteboardRoomInfo.roomUUID,
            roomToken: whiteboardRoomInfo.roomToken,
        },
    }));

    const [uiConfig] = useState(() => ({
        page_control: { enable: true },
        redo_undo: { enable: true },
        toolbar: { enable: true },
        zoom_control: { enable: true }
    }));
 
    const handleCloseWhite = () => {
        Modal.alert({
            title: intl.get('close_white'),
            content: intl.get('close_white_tips'),
            showCloseButton: true,
            confirmText: <span>确定</span>,
            onConfirm: () => handleClose()
        })
    }

    return createPortal(<RoomWhite>
        <Fastboard app={fastboard} language="en" theme="light" config={uiConfig} />
        <RoomControllerBox>
            <RoomControllerMidBox>
                <PagePreviewCell title={intl.get('upload_img')}>
                    <Upload 
                        action={`/v1/agorartc/tenant/${config.tenantId}/whiteboard/call/${callId}/conversion/upload`}
                        multiple={true}
                        onStart={file => console.log('onStart', file, file.name)}
                        onSuccess={ret => fastboard.insertImage(ret.entity)}
                        onError={err => console.log('onError', err)}
                    >
                        <img src={imageSvg} />
                    </Upload>
                </PagePreviewCell>
                <PagePreviewCell title={intl.get('upload_video')}>
                    <Upload
                        action={`/v1/agorartc/tenant/${config.tenantId}/whiteboard/call/${callId}/conversion/upload`}
                        multiple={true}
                        accept=".mp4"
                        onStart={file => console.log('onStart', file, file.name)}
                        onSuccess={ret => fastboard.insertMedia('', ret.entity)}
                        onError={err => console.log('onError', err)}
                    >
                        <img src={videoSvg} />
                    </Upload>
                </PagePreviewCell>
                <PagePreviewCell title={intl.get('upload_audio')}>
                    <Upload 
                        action={`/v1/agorartc/tenant/${config.tenantId}/whiteboard/call/${callId}/conversion/upload`}
                        multiple={true}
                        accept=".mp3"
                        onStart={file => console.log('onStart', file, file.name)}
                        onSuccess={ret => fastboard.insertMedia('', ret.entity)}
                        onError={err => console.log('onError', err)}
                    >
                        <img src={audioSvg} />
                    </Upload>
                </PagePreviewCell>
                <PagePreviewCell title={intl.get('close_white')}>
                    <img src={exitSvg} onClick={handleCloseWhite} />
                </PagePreviewCell>
            </RoomControllerMidBox>
        </RoomControllerBox>
    </RoomWhite>
    , whiteboardRoomInfo.domNode || domNode)
}
