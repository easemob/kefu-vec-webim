import "video.js/dist/video-js.css";

import * as React from "react";
import { createPortal } from 'react-dom'
// import {RouteComponentProps} from "react-router";
import {
    createPlugins,
    DefaultHotKeys, DeviceType,
    PPTKind,
    Room,
    RoomPhase,
    RoomState,
    ViewMode,
    WhiteWebSdk,
    WhiteWebSdkConfiguration,
    InvisiblePlugin,
} from "white-web-sdk";
import ToolBox from "@/facetime/view/whiteboard/packages/tool-box";
import RedoUndo from "@/facetime/view/whiteboard/packages/redo-undo";
import PageController from "@/facetime/view/whiteboard/packages/page-controller";
import ZoomController from "@/facetime/view/whiteboard/packages/zoom-controller";
import OssUploadButton, { UploadType } from "@/facetime/view/whiteboard/packages/oss-upload-button";
import {videoPlugin} from "@netless/white-video-plugin";
import {audioPlugin} from "@netless/white-audio-plugin";
import {videoPlugin2} from "@netless/white-video-plugin2";
import {audioPlugin2} from "@netless/white-audio-plugin2";
import { videoJsPlugin } from "@netless/video-js-plugin"
import PreviewController from "@/facetime/view/whiteboard/packages/preview-controller";
import DocsCenter from "@/facetime/view/whiteboard/packages/docs-center";
import {CursorTool} from "@/facetime/view/whiteboard/packages/cursor-tool";
import {Antd} from '@kefu/in-uikit';
import {netlessWhiteboardApi} from "./apiMiddleware";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";
import pages from "./assets/image/pages.svg"
// import folder from "./assets/image/folder.svg";
import follow from "./assets/image/follow.svg"
import followActive from "./assets/image/follow-active.svg";
import {h5DemoUrl, h5DemoUrl3, ossConfigObj, supplierUrl} from "./appToken";
import "./WhiteboardPage.less";
// import InviteButton from "./components/InviteButton";
import ExitButtonRoom from "./components/ExitButtonRoom";
import {Identity} from "./IndexPage";
import OssDropUpload from "@/facetime/view/whiteboard/packages/oss-drop-upload";
import {pptData} from "./taskUuids";
import {PPTDataType} from "@/facetime/view/whiteboard/packages/oss-upload-manager";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {LocalStorageRoomDataType} from "./HistoryPage";
import {IframeWrapper, IframeBridge} from "@netless/iframe-bridge";
import { IframeAdapter } from "./tools/IframeAdapter";
// import { H5UploadButton } from "./components/H5UploadButton";
import i18n from "./i18n"
import { ossConfigForRegion } from "./region";
import {isMobile, isWindows} from "react-device-detect";
import { SupplierAdapter } from "./tools/SupplierAdapter";
import { withTranslation, WithTranslation } from "react-i18next";
// import FloatLink from "./FloatLink";
// import { SlidePrefetch } from "@netless/slide-prefetch";
import { WhitePPTPlugin } from "@netless/ppt-plugin";
const {message, Tooltip} = Antd;

export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    mode?: ViewMode;
    whiteboardLayerDownRef?: HTMLDivElement;
    roomController?: ViewMode;
    pptPlugin?: WhitePPTPlugin;
};
export type WhiteboardPageProps = {
    uuid: string;
    userId: string;
    roomToken: string;
    callId: string;
    appIdentifier: string;
    domNode: HTMLElement | undefined;
    onCloseWhiteBoard: () => void;
};

class WhiteboardPage extends React.Component<WhiteboardPageProps & WithTranslation, WhiteboardPageStates> {
    // private slidePrefetch: SlidePrefetch;

    public constructor(props: WhiteboardPageProps & WithTranslation) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            isMenuVisible: false,
            isFileOpen: false,
        };
        // this.slidePrefetch = new SlidePrefetch({
        //     baseUrl: "https://convertcdn.netless.link",
        //     cacheName: "netless",
        //     verbose: true,
        // });
        (window as any).InvisiblePlugin = InvisiblePlugin;
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }

    public componentDidUpdate(prevProps, prevState): void {
        let { phase } = this.state
        if ((prevState.phase !== phase) && (phase === RoomPhase.Disconnected)) {
            this.props.onCloseWhiteBoard && this.props.onCloseWhiteBoard(); // 触发白板关闭的回调
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        // const {uuid, userId,roomToken} = this.props;
        //identity 有creator，joiner，indexPage.tsx,暂定为固定值。
        let identity = "creator";
        let region = "cn-hz";
        const {uuid, userId,roomToken,appIdentifier} = this.props;
        this.setRoomList(uuid, userId);
        const query = new URLSearchParams(window.location.search);
        const h5Url = decodeURIComponent(query.get("h5Url") || "");
        const h5Dir = query.get("h5Dir");
        try {
            // const roomToken = await this.getRoomToken(uuid);
            if (uuid && roomToken) {
                const plugins = createPlugins({
                    "video": videoPlugin, "audio": audioPlugin,
                    "video2": videoPlugin2, "audio2": audioPlugin2,
                    "video.js": videoJsPlugin(),
                });
                plugins.setPluginContext("video", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("audio", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("video2", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("audio2", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("video.js", { enable: identity === Identity.creator, verbose: true });

                let deviceType: DeviceType;
                if (isWindows) {
                    deviceType = DeviceType.Surface;
                } else {
                    if (isMobile) {
                        deviceType = DeviceType.Touch;
                    } else {
                        deviceType = DeviceType.Desktop;
                    }
                }
                let whiteWebSdkParams: WhiteWebSdkConfiguration = {
                    appIdentifier: appIdentifier,
                    plugins: plugins,
                    region,
                    preloadDynamicPPT: true,
                    deviceType: deviceType,
                    pptParams: {
                        useServerWrap: true,
                    },
                }
                const pluginParam = {
                    wrappedComponents: [/*Player*/] as any[],
                    invisiblePlugins: [/*WhitePPTPlugin*/] as any[],
                }
                if (h5Url) {
                    pluginParam.wrappedComponents.push(IframeWrapper);
                    pluginParam.invisiblePlugins.push(IframeBridge);
                }
                whiteWebSdkParams = Object.assign(whiteWebSdkParams, pluginParam);
                const whiteWebSdk = new WhiteWebSdk(whiteWebSdkParams);
                const cursorName = localStorage.getItem("userName");
                const cursorAdapter = new CursorTool();
                const room = await whiteWebSdk.joinRoom(
                    {
                        uid: uuid,
                        uuid: uuid,
                        roomToken: roomToken,
                        cursorAdapter: cursorAdapter,
                        userPayload: {
                            userId: userId,
                            cursorName: cursorName,
                            // theme: "mellow",
                            // cursorBackgroundColor: "#FDBA74",
                            // cursorTextColor: "#323233",
                            // cursorTagName: "讲师",
                            // cursorTagBackgroundColor: "#E5A869",
                        },
                        disableNewPencil: false,
                        floatBar: true,
                        hotKeys: {
                            ...DefaultHotKeys,
                            changeToSelector: "s",
                            changeToLaserPointer: "z",
                            changeToPencil: "p",
                            changeToRectangle: "r",
                            changeToEllipse: "c",
                            changeToEraser: "e",
                            changeToText: "t",
                            changeToStraight: "l",
                            changeToArrow: "a",
                            changeToHand: "h",
                        },
                    },
                    {
                        onPhaseChanged: phase => {
                            this.setState({phase: phase});
                        },
                        onRoomStateChanged: (modifyState: Partial<RoomState>): void => {
                            if (modifyState.broadcastState) {
                                this.setState({mode: modifyState.broadcastState.mode});
                            }
                        },
                        onDisconnectWithError: error => {
                            console.error(error);
                        },
                        onKickedWithReason: reason => {
                            console.error("kicked with reason: " + reason);
                        },
                    });
                cursorAdapter.setRoom(room);
                this.setDefaultPptData(pptData, room);
                if (room.state.broadcastState) {
                    this.setState({mode: room.state.broadcastState.mode})
                }
                this.setState({room: room});
                (window as any).room = room;
                if (h5Url && h5Dir) {
                    await this.handleEnableH5(room, h5Url, h5Dir);
                } else if (h5Url) {
                    await this.handleEnableH5(room, h5Url);
                }
                // this.slidePrefetch.listen(room);
                // await this.handlePPTPlugin(room);
            }
        } catch (error) {
            message.error(String(error));
            console.trace(error);
        }
    }
    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (roomToken) {
            return roomToken;
        } else {
            return null;
        }
    }
    public componentWillUnmount() {
        this.refs.ExitButtonRoom?.handleGoBack();
        // this.slidePrefetch.stop();
    }
   
    private handleBindRoom = (ref: HTMLDivElement): void => {
        const {room} = this.state;
        this.setState({whiteboardLayerDownRef: ref});
        if (room) {
            room.bindHtmlElement(ref);
        }
    }

    private setDefaultPptData = (pptData: string[], room: Room): void => {
        const docs: PPTDataType[] = (room.state.globalState as any).docs;
        if (docs && docs.length > 1) {
            return;
        }
        if (pptData.length > 0) {
            for(let data of pptData){
                const sceneId = uuidv4();
                const scenes = JSON.parse(data);
                const documentFile: PPTDataType = {
                    active: false,
                    id: sceneId,
                    pptType: PPTKind.Dynamic,
                    data: scenes,
                };
                const docs = (room.state.globalState as any).docs;
                if (docs && docs.length > 0) {
                    const newDocs = [documentFile, ...docs];
                    room.setGlobalState({docs: newDocs});
                } else {
                    room.setGlobalState({docs: [documentFile]});
                }
                room.putScenes(`/${room.uuid}/${sceneId}`, scenes);
            }
        }
    }

    public setRoomList = (uuid: string, userId: string): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...roomArray,
                    ]),
                );
            } else {
                const newRoomArray = roomArray.filter(data => data.uuid !== uuid);
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ]),
                );
            }
        } else {
            localStorage.setItem(
                "rooms",
                JSON.stringify([
                    {
                        uuid: uuid,
                        time: timestamp,
                        identity: Identity.creator,
                        userId: userId,
                    },
                ]),
            );
        }
    }

    private handlePPTPlugin = async (room: Room): Promise<void> => {
        const {roomToken} = this.props;

        let bridge = room.getInvisiblePlugin(WhitePPTPlugin.kind) as WhitePPTPlugin;
        if (!bridge) {

            await room.createInvisiblePlugin(WhitePPTPlugin, {});
        }

        bridge = room.getInvisiblePlugin(WhitePPTPlugin.kind) as WhitePPTPlugin;

        bridge.setupConfig({
            assetsDomain: "https://convertcdn.netless.link",
            sdkToken: roomToken,
            loadConfig: {
                scheme: "https",
                useServerWrap: true,
            },
        });
        this.setState({
            pptPlugin: bridge,
        });
        WhitePPTPlugin.eventHub.on(WhitePPTPlugin.EVENTS.ERROR, e => console.log(e));
    }

    private handleEnableH5 = async (room: Room, h5Url: string, dir?: string): Promise<void> => {
        let bridge = await room.getInvisiblePlugin(IframeBridge.kind);
        const userId = {identity:"creator",uuid:"cd27ca00b94d11ec880c7347bf3cd6af",userId:"13161",region:"cn-hz"}.userId;
        if (!bridge) {
            const h5SceneDir = dir || "/h5";
            let totalPage = 6;
            bridge = await IframeBridge.insert({
                room,
                url: h5Url,
                width: 1280,
                height: 720,
                displaySceneDir: h5SceneDir,
                useClicker: true
            });
            if (h5Url === h5DemoUrl3) {
                totalPage = 14;
            }
            if ([h5DemoUrl, h5DemoUrl3].includes(h5Url) || dir) {
                const scenes = room.entireScenes();
                if (!scenes[h5SceneDir]) {
                    room.putScenes(h5SceneDir, this.createH5Scenes(totalPage));
                }
                if (room.state.sceneState.contextPath !== h5SceneDir) {
                    room.setScenePath(h5SceneDir);
                }
            }
        }
        if (dir) {
            new IframeAdapter(room, bridge as IframeBridge, userId, h5Url)
        }
        if (h5Url === supplierUrl) {
            new SupplierAdapter(room, bridge as IframeBridge, userId, h5Url);
        }
        (window as any).bridge = bridge;
    }


    private createH5Scenes = (pageNumber: number) => {
        return new Array(pageNumber).fill(1).map((_, index) => ({ name: `${index + 1}` }));
    }

    private handlePreviewState = (state: boolean): void => {
        this.setState({isMenuVisible: state});
    }

    private handleDocCenterState = (state: boolean): void => {
        this.setState({isFileOpen: state});
    }

    private handleRoomController = (room: Room): void => {
        const { t } = this.props;
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success(t('other-users-will-follow-your-vision'));
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success(t('other-users-will-stop-follow-your-vision'));
        }
    }

    private isAllPresent(obj: Record<string, any>) {
        return Object.values(obj).every(Boolean);
    }

    public render() {
        let domNode = this.props.domNode;

        return domNode instanceof HTMLElement 
            ? createPortal(this.renderCom(), domNode)
            : null
    }

    public renderCom(): React.ReactNode {
        const {pptPlugin, room, isMenuVisible, isFileOpen, phase, whiteboardLayerDownRef} = this.state;
        // const { identity, uuid, userId, region } = this.props.match.params;
        const { userId,roomToken,callId,appIdentifier} = this.props;
        let region = "cn-hz";

        if(app.lang == "zh-CN" ){
            region = "cn-hz";
        }
        else{
            region = "us-sv";
        }
        let ossConfig = { ...ossConfigObj };
        if (region !== "cn-hz") {
            ossConfig = { ...ossConfig, ...(ossConfigForRegion[region] || {}) };
        }
        const useUpload = this.isAllPresent(ossConfig);
        // const useUploadH5 = this.isAllPresent(h5OssConfigObj);
        if (room === undefined) {
            return <LoadingPage/>;
        }
        switch (phase) {
            case (RoomPhase.Connecting || RoomPhase.Disconnecting || RoomPhase.Reconnecting): {
                return <LoadingPage/>;
            }
            case RoomPhase.Disconnected: {
                return <PageError/>;
            }
            default: {
                return (
                    <div 
                        className="realtime-box" 
                        onMouseDown={(e) => void e.stopPropagation()}
                        onMousemove={(e) => void e.stopPropagation()}
                        onMouseUp={(e) => void e.stopPropagation()}
                        onMouseLeave={(e) => void e.stopPropagation()}
                    >
                         {/* <FloatLink /> */}
                        {/*<div className="logo-box">*/}
                        {/*    <img src={logo} alt={"logo"}/>*/}
                        {/*</div>*/}
                        {/* 
                            1、选择滑动报错
                            2、文本报错
                        */}
                        <div className="tool-box-out">
                            <ToolBox i18nLanguage={app.lang} room={room} hotkeys={{
                                arrow: "A",
                                clear: "",
                                clicker: "",
                                ellipse: "C",
                                eraser: "E",
                                hand: "H",
                                laserPointer: "Z",
                                pencil: "P",
                                rectangle: "R",
                                selector: "S",
                                shape: "",
                                straight: "L",
                                text: "T"
                            }} customerComponent={
                                useUpload ? [
                                    <OssUploadButton oss={ossConfig}
                                                     pptPlugin={pptPlugin}
                                                     appIdentifier={appIdentifier}
                                                     sdkToken={roomToken}
                                                     room={room}
                                                     region={region}
                                                     i18nLanguage={app.lang}
                                                     whiteboardRef={whiteboardLayerDownRef}
                                                     callId = {callId}
                                                     enables={[
                                                        UploadType.Image,
                                                        UploadType.Video,
                                                        UploadType.Audio,
                                                        // UploadType.Dynamic,
                                                        // UploadType.Static,
                                                        // UploadType.DynamicPlugin, // not working now
                                                     ]} />,
                                ] : undefined
                            }/>
                        </div>
                        {/* 撤销 */}
                        <div className="redo-undo-box">
                            <RedoUndo room={room}/>
                        </div>
                        {/* 放大缩小定位 */}
                        <div className="zoom-controller-box">
                            <ZoomController room={room}/>
                        </div>
                        {/* 上传文件等 */}
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <Tooltip placement="bottom" title={app.t("layout.facetime.whiteboard_tool_visionControl")}>
                                    <div className="page-preview-cell"
                                         onClick={()=> this.handleRoomController(room)}>
                                        <img style={{width: "28px"}} src={this.state.mode === ViewMode.Broadcaster ? followActive : follow} alt={"follow"}/>
                                    </div>
                                </Tooltip>
                                {/* <Tooltip placement="bottom" title={"Docs center"}>
                                    <div className="page-preview-cell"
                                         onClick={() => this.setState({isFileOpen: !this.state.isFileOpen})}>
                                        <img style={{width: "28px"}} src={folder} alt={"folder"}/>
                                    </div>
                                </Tooltip>
                                {useUploadH5 && <Tooltip placement="bottom" title={"HTML5 Course"}>
                                    <H5UploadButton region={region as Region} room={room} {...this.props} />
                                </Tooltip>}
                                <InviteButton uuid={uuid} region={region as Region} /> */}
                                <ExitButtonRoom ref="ExitButtonRoom" identity={Identity.creator}  room={room} userId={userId} />
                            </div>
                        </div>
                        {/* 分页 */}
                        <div className="page-controller-box">
                            <div className="page-controller-mid-box">
                                <PageController pptPlugin={pptPlugin} usePPTPlugin={true} room={room}/>
                                <Tooltip placement="top" title={app.t("layout.facetime.whiteboard_tool_pagePreview")}>
                                    <div className="page-preview-cell" onClick={() => this.handlePreviewState(true)}>
                                        <img src={pages} alt={"pages"}/>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                        <PreviewController handlePreviewState={this.handlePreviewState} isVisible={isMenuVisible}
                                           room={room}/>
                        <DocsCenter handleDocCenterState={this.handleDocCenterState}
                            isFileOpen={isFileOpen}
                            room={room}
                            i18nLanguage={app.lang}/>
                        {useUpload ? <OssDropUpload
                            room={room}
                            region={region}
                            oss={ossConfig}>
                            <div
                                ref={this.handleBindRoom}
                                className="whiteboard-box" />
                        </OssDropUpload> : <div
                                ref={this.handleBindRoom}
                                className="whiteboard-box" />}
                    </div>
                );
            }
        }
    }
}

export default withTranslation()(WhiteboardPage);
