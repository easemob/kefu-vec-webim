import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import {WhitePPTPlugin} from "@netless/ppt-plugin";
import next from "./image/next.svg";
import nextDisabled from "./image/next-disabled.svg";
import back from "./image/back.svg";
import backDisabled from "./image/back-disable.svg";
import first from "./image/first-active.svg";
import firstDisabled from "./image/first-disable.svg";
import last from "./image/last-active.svg";
import lastDisabled from "./image/last-disable.svg";
import "./index.less";

export type PageControllerProps = {
    room: Room;
    pptPlugin?: WhitePPTPlugin;
    usePPTPlugin: boolean;
}
;
export type PageControllerStates = {
    roomState: RoomState;
};

export default class PageController extends React.Component<PageControllerProps, PageControllerStates> {

    private page: number = 0;

    public constructor(props: PageControllerProps) {
        super(props);
        this.state = {
            roomState: props.room.state,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        this.page = room.state.sceneState.index;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    private handlePptPreviousStep = async (): Promise<void> => {
        const {room, usePPTPlugin, pptPlugin} = this.props;
        if (usePPTPlugin && pptPlugin?.isHandleCurrentScene) {
            pptPlugin.prevStep();
        } else {
            room.pptPreviousStep();
        }
    }

    private handlePptNextStep = async (): Promise<void> => {
        const {room, usePPTPlugin, pptPlugin} = this.props;
        if (usePPTPlugin && pptPlugin?.isHandleCurrentScene) {
            pptPlugin.nextStep();
        } else {
            room.pptNextStep();
        }
    }

    private pageNumber = (): React.ReactNode => {
        const {roomState} = this.state;
        const {room} = this.props;
        const activeIndex = roomState.sceneState.index;
        if (this.page !== activeIndex) {
            this.page = activeIndex;
            room.scalePptToFit();
        }
        const scenes = roomState.sceneState.scenes;
        return (
            <div className="whiteboard-annex-arrow-page">
                {activeIndex + 1} / {scenes.length}
            </div>
        );
    }

    private isFirst = (): boolean => {
        const {roomState} = this.state;
        const activeIndex = roomState.sceneState.index;
        return activeIndex === 0;
    }

    private isLast = (): boolean => {
        const {roomState} = this.state;
        const activeIndex = roomState.sceneState.index;
        const lastIndex = roomState.sceneState.scenes.length - 1;
        return activeIndex === lastIndex;
    }

    private setLastStep = (): void => {
        const {room} = this.props;
        const {roomState} = this.state;
        const lastIndex = roomState.sceneState.scenes.length - 1;
        room.setSceneIndex(lastIndex);
    }

    private setFirstStep = (): void => {
        const {room} = this.props;
        room.setSceneIndex(0);
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-annex-box">
                <div onClick={() => this.setFirstStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isFirst() ? firstDisabled : first} alt={"first"}/>
                </div>
                <div onClick={() => this.handlePptPreviousStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isFirst() ? backDisabled : back} alt={"back"}/>
                </div>
                {this.pageNumber()}
                <div onClick={() => this.handlePptNextStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isLast() ? nextDisabled : next} alt={"next"}/>
                </div>
                <div onClick={() => this.setLastStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isLast() ? lastDisabled : last} alt={"last"}/>
                </div>
            </div>
        );
    }
}
