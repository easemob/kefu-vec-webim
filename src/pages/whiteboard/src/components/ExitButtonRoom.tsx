import * as React from "react";
import {Antd} from '@kefu/in-uikit';
// import {RouteComponentProps} from "react-router";
// import { withRouter } from "react-router-dom";
import {Room} from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
// import replayScreen from "../assets/image/replay-screen.png";
import { Identity } from "../IndexPage";
import {netlessWhiteboardApi} from "../apiMiddleware";
import { LocalStorageRoomDataType } from "../HistoryPage";
import { withTranslation, WithTranslation } from 'react-i18next';
// import { getQueryH5Url } from "../tools/QueryGetter";
// import { region } from "../region";
const { Modal, message, Tooltip} = Antd;

let { confirm } = Modal;

function showConfirm() {
    return new Promise((resolve, reject) => {
        confirm({
            title: app.t("layout.facetime.whiteboard_tool_exitWhiteboard"),
            okText: app.t("layout.facetime.whiteboard_tool_confirm"),
            cancelText: app.t("layout.facetime.whiteboard_tool_cancel"),
            content: app.t("layout.facetime.whiteboard_tool_exitWhiteboardTip"),
            zIndex: 2001,
            onOk() {
                resolve();
            },
            onCancel() {
                reject();
            }
        })
    })
}

export type ExitButtonRoomStates = {
    exitViewDisable: boolean;
    isLoading: boolean;
};

export type ExitButtonRoomProps = {
    room: Room;
    userId: string;
    identity: Identity;
    exit:any;
};

class ExitButtonRoom extends React.Component<ExitButtonRoomProps & WithTranslation, ExitButtonRoomStates> {
    public constructor(props: ExitButtonRoomProps & WithTranslation) {
        super(props);
        this.state = {
            exitViewDisable: false,
            isLoading: false,
        };
    }

    // private handleReplay = async (sync = false): Promise<void> => {
    //     const { room, userId, identity } = this.props;
    //     if (room) {
    //         await this.setCover(room);
    //         await room.disconnect();
    //         // const replayPagePath = sync ? "replay-video" : "replay";
    //         // let url = `/${replayPagePath}/${identity}/${room.uuid}/${userId}/${region}`;
    //         // const h5Url = getQueryH5Url();
    //         // if (h5Url) {
    //         //     url = url + `?h5Url=${encodeURIComponent(h5Url)}`;
    //         // }
    //         // this.props.history.push(url);
    //     }
    // }

    private handleGoBack = async (): Promise<void> => {
        await showConfirm();
        const {room} = this.props;
        await this.setCover(room);
        await room.disconnect();
        // this.props.history.push("/");
    }

    private setCover = async (room: Room): Promise<void> => {
        try {
            this.setState({ isLoading: true });
            const res = await netlessWhiteboardApi.room.getCover(
                room.uuid,
                room.state.sceneState.scenePath,
                192,
                144,
                room.roomToken,
            );
            const rooms = localStorage.getItem("rooms");
            if (rooms) {
                const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
                const roomData = roomArray.find(data => data.uuid === room.uuid);
                const newRoomData = roomArray.filter(data => data.uuid !== room.uuid);
                if (roomData) {
                    roomData.cover = res.url;
                }
                localStorage.setItem("rooms", JSON.stringify([roomData, ...newRoomData]));
            }
            this.setState({ isLoading: false });
        } catch (error) {
            message.error(error);
            this.setState({ isLoading: false });
        }
    };

    public render(): React.ReactNode {
        // const { t } = this.props
        return (
            <div>
                <Tooltip placement="bottom" title={app.t("layout.facetime.whiteboard_tool_exit")}>
                    <div className="page-preview-cell" onClick={() => this.handleGoBack()}>
                        <img src={exit} style={{width: "28px"}} alt={"exit"}/>
                    </div>
                </Tooltip>
                {/* <Modal
                    visible={this.state.exitViewDisable}
                    footer={null}
                    title={t('exitRoom')}
                    onCancel={() => this.setState({exitViewDisable: false})}
                >
                    <div className="modal-box">
                        <div onClick={() => this.handleReplay()}>
                            <img className="modal-box-img" src={replayScreen} alt={"img"}/>
                        </div>
                        <div className="modal-box-name">{t('watchReplay')}</div>
                        <div onClick={() => this.handleReplay(true)}>
                            <img className="modal-box-img" src={replayScreen} alt={"img"}/>
                        </div>
                        <div className="modal-box-name">{t('syncReplay')}</div>
                        <Button
                            loading={this.state.isLoading}
                            onClick={this.handleGoBack}
                            style={{width: 176}}
                            size="large">
                            {t('confirmExit')}
                        </Button>
                    </div>
                </Modal> */}
            </div>
        );
    }
}

export default withTranslation()(ExitButtonRoom)

