import * as React from "react";
import "./Storage.less";
import "@netless/zip";

import { Button, Progress, Tag } from "antd";
import { Link } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import { taskUuids, taskUuuidsToPush } from "./taskUuids";
import { AsyncRefresher } from './tools/AsyncRefresher';
import { netlessCaches } from "./NetlessCaches";
import { withTranslation, WithTranslation } from "react-i18next"


import * as zip_icon from "./assets/image/zip.svg";
import empty_box from "./assets/image/empty-box.svg";

import {
    DownloadingMode,
    DownloadLogic,
    DownloadLogicState,
    PPTState,
    PPTTask,
    TaskPhase,
} from './logics/DownloadLogic';
import FloatLink from "./FloatLink";

export type StorageState = DownloadLogicState & {
    readonly downloader?: DownloadLogic;
    readonly isAdding: boolean;
    readonly nextAddIndex: number;
    readonly space?: number;
    readonly availableSpace?: number;
};

class Storage extends React.Component<WithTranslation, StorageState> {

    private readonly spaceRefresher: AsyncRefresher = new AsyncRefresher(100, async () => {
        const space = await netlessCaches.calculateCache();
        const availableSpace = await netlessCaches.availableSpace();
        this.setState({
            space: Math.round(space),
            availableSpace: Math.round(availableSpace),
        });
    });

    public constructor(props: WithTranslation) {
        super(props);
        this.state = {
            mode: DownloadingMode.Freedom,
            isAdding: false,
            nextAddIndex: 0,
            pptStates: [],
        };
    }

    public async componentDidMount(): Promise<void> {
        const { t } = this.props;
        try {
            const tasks: PPTTask[] = taskUuids.map(task => ({
                uuid: task.taskUuid,
                name: task.name || "",
            }));
            const downloader = await DownloadLogic.create(tasks, {
                onUpdateState: state => this.setState(state as any),
                onSpaceUpdate: () => this.spaceRefresher.invoke(),
                onCatchDownloadingError: this.onCatchDownloadingError,
            });
            this.setState({...downloader.state, downloader});
            this.spaceRefresher.invoke();

        } catch (error) {
            console.error(error);
        }
    }

    public componentWillUnmount(): void {
        this.spaceRefresher.cancel();
    }

    private onCatchDownloadingError = (error: Error, task: PPTTask): void => {
        console.error(`download task ${task.uuid} failed:`, error);
    }

    public render(): React.ReactNode {
        const downloader = this.state.downloader;

        if (!downloader) {
            return null;
        }
        return (
            <div className="page-index-box">
                <FloatLink />
                <div className="page-index-mid-box">
                    {this.renderHeadView(downloader)}
                    {this.state.pptStates.length === 0 ? (
                        <div className="page-history-body-empty">
                            <img src={empty_box} alt={"empty_box"} />
                        </div>
                    ) : (
                        <div className="page-history-body">
                            {this.state.pptStates.map(
                                pptState => this.renderZipCell(downloader, pptState),
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private renderHeadView(downloader: DownloadLogic): React.ReactNode {
        const { t } = this.props
        const shouldDisplaySpaceTag = (
            typeof this.state.space === "number" &&
            typeof this.state.availableSpace === "number"
        );
        return (
            <div className="page-history-head">
                <div className="page-history-head-left">
                    <Link to={"/"}>
                        <div className="page-history-back">
                            <LeftOutlined /> <div>{t('back')}</div>
                        </div>
                    </Link>
                    {shouldDisplaySpaceTag && <Tag
                        color={"blue"}
                        style={{marginLeft: 8}}>{this.state.space}(mb) / {this.state.availableSpace}(mb)
                    </Tag>}
                </div>
                <div>
                    {this.renderAddTaskButton(downloader)}
                    {this.renderDownloadOneByOneButton(downloader)}
                    {this.renderCleanAllCacheButton(downloader)}
                </div>
            </div>
        );
    }

    private async onClickAddTask(downloader: DownloadLogic): Promise<void> {
        const {taskUuid, name} = taskUuuidsToPush[this.state.nextAddIndex];
        const task: PPTTask = {
            uuid: taskUuid,
            name: name || "",
        };
        this.setState({
            isAdding: true,
        });
        try {
            await downloader.addTask(task);
        } finally {
            this.setState({
                isAdding: false,
                nextAddIndex: this.state.nextAddIndex + 1,
            });
        }
    }

    private renderAddTaskButton(downloader: DownloadLogic): React.ReactNode {
        const { t } = this.props
        let disableAdd = false;
        if (this.state.nextAddIndex >= taskUuuidsToPush.length) {
            disableAdd = true;
        } else if (this.state.isAdding) {
            disableAdd = true;
        }
        return (
            <Button
                type="link"
                disabled={disableAdd}
                size={"small"}
                style={{ marginRight: 20, fontSize: 14 }}
                onClick={() => this.onClickAddTask(downloader)}>
                {t('add')}
            </Button>
        );
    }

    private renderDownloadOneByOneButton(downloader: DownloadLogic): React.ReactNode {
        const { t } = this.props
        let node: React.ReactNode = null;
        switch (this.state.mode) {
            case DownloadingMode.OneByOne: {
                node = (
                    <Button
                        type="link"
                        size={"small"}
                        style={{ marginRight: 20, fontSize: 14 }}
                        onClick={() => downloader.abort()}>
                        {t('stopDownload')}
                    </Button>
                );
                break;
            }
            case DownloadingMode.Freedom: {
                const disabled = (
                    this.state.pptStates.some(ppt => ppt.phase === TaskPhase.Downloading) ||
                    !this.state.pptStates.some(ppt => ppt.phase === TaskPhase.NotCached)
                );
                node = (
                    <Button
                        type="link"
                        size={"small"}
                        style={{ marginRight: 20, fontSize: 14 }}
                        disabled={disabled}
                        onClick={() => downloader.startOneByOne()}>
                        {t('downloadAll')}
                    </Button>
                );
                break;
            }
        }
        return node;
    }

    private renderCleanAllCacheButton(downloader: DownloadLogic): React.ReactNode {
        const { t } = this.props
        const enable = (
            this.state.mode === DownloadingMode.Freedom &&
            this.state.pptStates.some(ppt => ppt.phase !== TaskPhase.NotCached)
        );
        return (
            <Button
                type="link"
                size={"small"}
                disabled={!enable}
                style={{ marginRight: 20, fontSize: 14 }}
                onClick={() => downloader.removeAll()}>
                {t('clearCache')}
            </Button>
        );
    }

    private renderZipCell(downloader: DownloadLogic, pptState: PPTState): React.ReactNode {
        const { t } = this.props
        const displayProgress = (
            pptState.phase === TaskPhase.Downloading
        );
        const enableRemoveCache = (
            this.state.mode === DownloadingMode.Freedom &&
            pptState.phase === TaskPhase.Cached
        );
        return (
            <div key={pptState.uuid}>
                <div className="room-cell-box">
                    <div className="room-cell-left">
                        <div className="room-cell-image">
                            <img src={zip_icon} alt={"cover"} />
                            {displayProgress &&
                                <div className="room-cell-image-cover">
                                    <Progress
                                        width={42}
                                        style={{color: "white"}}
                                        strokeWidth={6}
                                        type="circle"
                                        trailColor={"white"}
                                        percent={pptState.progress} />
                                </div>
                            }
                        </div>
                        <div>
                            <div className="room-cell-text">{pptState.name}</div>
                        </div>
                    </div>
                    <div className="room-download-cell-right">
                        {this.renderDownloadButton(downloader, pptState)}
                        <Button
                            onClick={() => downloader.removeTask(pptState.uuid)}
                            disabled={!enableRemoveCache}
                            style={{width: 96}}>
                            {t('delete')}
                        </Button>
                    </div>
                </div>
                <div className="room-cell-cut-line" />
            </div>
        );
    }

    private renderDownloadButton(downloader: DownloadLogic, pptState: PPTState): React.ReactNode {
        const { t } = this.props
        const enable = (
            this.state.mode === DownloadingMode.Freedom &&
            pptState.phase !== TaskPhase.Cached
        );
        switch (pptState.phase) {
            case TaskPhase.NotCached: {
                return (
                    <Button
                        onClick={() => downloader.startTask(pptState.uuid)}
                        type={"primary"}
                        disabled={!enable}
                        style={{width: 96}}>
                        {t('download')}
                    </Button>
                );
            }
            case TaskPhase.Downloading: {
                return (
                    <Button
                        onClick={() => downloader.abortTask(pptState.uuid)}
                        type={"primary"}
                        disabled={!enable}
                        style={{width: 96}}>
                        {t('stop')}
                    </Button>
                );
            }
            case TaskPhase.Cached: {
                return (
                    <Button
                        disabled
                        type={"primary"}
                        style={{width: 96}}>
                        {t('downloaded')}
                    </Button>
                );
            }
            case TaskPhase.Failed: {
                return (
                    <Button
                        onClick={() => downloader.startTask(pptState.uuid)}
                        type={"primary"}
                        disabled={!enable}
                        style={{width: 96}}>
                        {t('downloadAgain')}
                    </Button>
                );
            }
        }
    }
}

export default withTranslation()(Storage)
