import * as React from "react";
import { RouteComponentProps } from "react-router";
import "./CreatePage.less";
import logo from "./assets/image/logo.png";
import { Button, Input, Select } from "antd";
import { Link } from "react-router-dom";
import { Identity } from "./IndexPage";
import { LocalStorageRoomDataType } from "./HistoryPage";
import moment from "moment";
import { netlessWhiteboardApi } from "./apiMiddleware";
import { withTranslation, WithTranslation } from "react-i18next";
import { h5DemoUrl, h5DemoUrl2, h5DemoUrl3, supplierUrl } from "./appToken";
import { region } from "./region";
import FloatLink from "./FloatLink";

const { Option } = Select;

export type CreatePageStates = {
    roomName: string;
    value: boolean;
    h5Url: string;
};

class CreatePage extends React.Component<
    RouteComponentProps & WithTranslation,
    CreatePageStates
> {
    public constructor(props: RouteComponentProps & WithTranslation) {
        super(props);
        this.state = {
            roomName: "",
            value: false,
            h5Url: this.props.t("tryH5Courseware"),
        };
    }

    private createRoomAndGetUuid = async (
        room: string,
        limit: number
    ): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.createRoomApi(room, limit);
        if (res.uuid) {
            return res.uuid;
        } else {
            return null;
        }
    };

    private handleSelectH5 = (value: string) => {
        this.setState({ h5Url: value });
    };

    private handleJoin = async (): Promise<void> => {
        const userId = `${Math.floor(Math.random() * 100000)}`;
        const uuid = await this.createRoomAndGetUuid(this.state.roomName, 0);
        if (uuid) {
            this.setRoomList(uuid, this.state.roomName, userId);
            let url = `/whiteboard/${Identity.creator}/${uuid}/${userId}/${region}`;
            if (
                this.state.h5Url &&
                this.state.h5Url !== this.props.t("tryH5Courseware")
            ) {
                url = url + `?h5Url=${encodeURIComponent(this.state.h5Url)}`;
            }
            this.props.history.push(url);
        }
    };

    public setRoomList = (
        uuid: string,
        roomName: string,
        userId: string
    ): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find((data) => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            roomName: roomName,
                            userId: userId,
                        },
                        ...roomArray,
                    ])
                );
            } else {
                const newRoomArray = roomArray.filter(
                    (data) => data.uuid !== uuid
                );
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            roomName: roomName,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ])
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
                        roomName: roomName,
                        userId: userId,
                    },
                ])
            );
        }
    };

    public render(): React.ReactNode {
        const { t } = this.props;
        const { roomName, h5Url } = this.state;
        return (
            <div className="page-index-box">
                <FloatLink />
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"} />
                        <span>0.0.1</span>
                    </div>
                    <div className="page-index-form-box">
                        <Input
                            placeholder={t("setRoomName")}
                            value={roomName}
                            style={{ marginBottom: 18 }}
                            onChange={(evt) =>
                                this.setState({ roomName: evt.target.value })
                            }
                            className="page-create-input-box"
                            size={"large"}
                        />
                        <div
                            style={{
                                marginBottom: 18,
                                width: "100%",
                                marginLeft: 95,
                            }}
                        >
                            <Select
                                size={"large"}
                                placeholder={t("tryH5Courseware")}
                                style={{ width: "80%" }}
                                onSelect={this.handleSelectH5}
                            >
                                <Option value={h5DemoUrl}>{h5DemoUrl}</Option>
                                <Option value={h5DemoUrl2}>{h5DemoUrl2}</Option>
                                <Option value={h5DemoUrl3}>{h5DemoUrl3}</Option>
                                <Option value={supplierUrl}>
                                    {supplierUrl}
                                </Option>
                            </Select>
                        </div>

                        <div className="page-index-btn-box">
                            <Link to={"/"}>
                                <Button
                                    className="page-index-btn"
                                    size={"large"}
                                >
                                    {t("backHomePage")}
                                </Button>
                            </Link>
                            <Button
                                className="page-index-btn"
                                disabled={roomName === ""}
                                size={"large"}
                                onClick={this.handleJoin}
                                type={"primary"}
                            >
                                {t("createRoom")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(CreatePage);
