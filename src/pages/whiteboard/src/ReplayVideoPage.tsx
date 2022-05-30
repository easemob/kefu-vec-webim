import * as React from "react";
import {RouteComponentProps} from "react-router";
import {CursorTool} from "../packages/cursor-tool/index";
import polly from "polly-js";
import {message} from "antd";
import {WhiteWebSdk, PlayerPhase, Player, createPlugins} from "white-web-sdk";
import video_play from "./assets/image/video-play.svg";
import "video.js/dist/video-js.css";
import "./ReplayPage.less";
import "./ReplayVideoPage.less";
import PageError from "./PageError";
import PlayerController from "@netless/player-controller";
import {netlessWhiteboardApi} from "./apiMiddleware";
import {netlessToken} from "./appToken";
import LoadingPage from "./LoadingPage";
import logo from "./assets/image/logo.png";
import ExitButtonPlayer from "./components/ExitButtonPlayer";
import { Identity } from "./IndexPage";
// import {videoPlugin} from "../packages/white-video-plugin/index";
// import {audioPlugin} from "../packages/white-audio-plugin/index";
import {videoPlugin2} from "@netless/white-video-plugin2";
import {audioPlugin2} from "@netless/white-audio-plugin2";
import CombinePlayerFactory from "@netless/combine-player";
import { CombinePlayer } from '@netless/combine-player/dist/Types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Region } from "./region";


export type PlayerVideoPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
    region: Region;
}>;


export type PlayerVideoPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
    combinePlayer?: CombinePlayer;
};

class NetlessVideoPlayer extends React.Component<PlayerVideoPageProps & WithTranslation, PlayerVideoPageStates> {
    private readonly videoRef: React.RefObject<HTMLVideoElement>;

    public constructor(props: PlayerVideoPageProps & WithTranslation) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isPlayerSeeking: false,
            isVisible: false,
            replayFail: false,
            replayState: false,
        };

        this.videoRef = React.createRef();
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        return roomToken || null;
    };

    public async componentDidMount(): Promise<void> {
        window.addEventListener("keydown", this.handleSpaceKey);
        const {uuid, identity, region} = this.props.match.params;
        const plugins = createPlugins({
            // "video": videoPlugin, "audio": audioPlugin,
            "video2": videoPlugin2, "audio2": audioPlugin2,
        });
        // plugins.setPluginContext("video", {identity: identity === Identity.creator ? "host" : ""});
        // plugins.setPluginContext("audio", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("video2", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("audio2", {identity: identity === Identity.creator ? "host" : ""});
        const roomToken = await this.getRoomToken(uuid);
        if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk({
                appIdentifier: netlessToken.appIdentifier,
                plugins,
                region,
            });
            await this.loadPlayer(whiteWebSdk, uuid, roomToken);
        }
    }

    private loadPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        await polly().waitAndRetry(10).executeForPromise(async () => {
            const isPlayable =  whiteWebSdk.isPlayable({ room: uuid, roomToken });

            if (!isPlayable) {
                throw Error("the current room cannot be replay");
            }

            return;
        });

        this.setState({replayState: true});
        await this.startPlayer(whiteWebSdk, uuid, roomToken);
    }

    private startPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        const cursorAdapter = new CursorTool();
        const player = await whiteWebSdk.replayRoom(
            {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: cursorAdapter,
            }, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onStoppedWithError: (error: Error) => {
                    message.error(`Playback error: ${error}`);
                    this.setState({replayFail: true});
                },
                onProgressTimeChanged: (scheduleTime: number) => {
                    this.setState({currentTime: scheduleTime});
                },
            });
        (window as any).player = player;
        cursorAdapter.setPlayer(player);
        this.setState({
            player: player,
        });

        this.initCombinePlayer(player);
    }

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const {player} = this.state;
        if (player) {
            player.bindHtmlElement(ref);
        }
    }

    private handleSpaceKey = (evt: any): void => {
        if (evt.code === "Space") {
            if (this.state.player && this.state.combinePlayer) {
                this.onClickOperationButton(this.state.player, this.state.combinePlayer);
            }
        }
    }

    private onClickOperationButton = (player: Player, combinePlayer: CombinePlayer | undefined): void => {
        if (!player || !combinePlayer) {
            return;
        }

        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause:
            case PlayerPhase.Ended:{
                console.log(1);
                combinePlayer.play();
                break;
            }
            case PlayerPhase.Playing: {
                combinePlayer.pause();
                break;
            }
        }
    }
    private renderScheduleView(): React.ReactNode {
        const {player, isVisible, combinePlayer} = this.state;
        if (player && isVisible && combinePlayer) {
            return (
                <div onMouseEnter={() => this.setState({isVisible: true})}>
                    <PlayerController player={player} combinePlayer={combinePlayer} i18nLanguage={this.props.i18n.language} />
                </div>
            );
        } else {
            return null;
        }
    }

    private initCombinePlayer(player: Player): void {
        const { t } = this.props
        if (this.videoRef.current === null) {
            return;
        }

        const combinePlayerFactory = new CombinePlayerFactory(player, {
            url: "https://docs-assets.oss-cn-hangzhou.aliyuncs.com/m3u8-video/test.m3u8",
            videoDOM: this.videoRef.current,
        }, true);

        const combinePlayer = combinePlayerFactory.create();

        combinePlayer.setOnStatusChange((status, message) => {
            console.log(t('changeStatus'), status, message);
        });

        this.setState({
            combinePlayer,
        });

        (window as any).combinePlayer = combinePlayer;

    }


    private getReplayPage() {
        const { t } = this.props
        const {player, phase, replayState, combinePlayer} = this.state;
        const { identity, uuid, userId } = this.props.match.params;
        if (this.state.replayFail) {
            return <PageError/>;
        }
        if (!replayState) {
            return <LoadingPage text={t('waitingReplayGenerate')}/>;
        }
        if (player === undefined) {
            return <LoadingPage/>;
        }
        switch (phase) {
            case (PlayerPhase.WaitingFirstFrame): {
                return <LoadingPage/>;
            }
            default: {
                return (
                    <div className="player-out-box">
                        <div className="logo-box">
                            <img src={logo} alt={"logo"}/>
                        </div>
                        <div className="player-board">
                            {this.renderScheduleView()}
                            <div
                                className="player-board-inner"
                                onMouseOver={() => this.setState({isVisible: true})}
                                onMouseLeave={() => this.setState({isVisible: false})}
                            >
                                <div
                                    onClick={() => this.onClickOperationButton(player, combinePlayer)}
                                    className="player-mask">
                                    {phase === PlayerPhase.Pause &&
                                    <div className="player-big-icon">
                                      <img
                                        style={{width: 50, marginLeft: 6}}
                                        src={video_play}
                                        alt={"video_play"}/>
                                    </div>}
                                </div>
                                <div style={{backgroundColor: "#F2F2F2"}}
                                     className="player-box"
                                     ref={this.handleBindRoom}/>
                            </div>
                        </div>
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <ExitButtonPlayer
                                    identity={identity}
                                    uuid={uuid}
                                    userId={userId}
                                    player={player}
                                />
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="overall-box">
                {this.getReplayPage()}
                <video
                    className="video-box video-js"
                    ref={this.videoRef}
                    width="500"
                />
            </div>
        )
    }
}

export default withTranslation()(NetlessVideoPlayer)
