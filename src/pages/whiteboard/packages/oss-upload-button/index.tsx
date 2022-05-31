import * as React from "react";
import {message, Popover, Upload} from 'antd'
import * as OSS from "ali-oss";
import type { WhitePPTPlugin } from "@netless/ppt-plugin";
import { PPTProgressPhase, UploadManager } from "../oss-upload-manager";
// import TopLoadingBar from "../loading-bar/index";
import "./index.less";
import { PPTKind, Room } from "white-web-sdk";
import upload from "./image/upload.svg";
import image from "./image/image.svg";
import uploadActive from "./image/upload-active.svg";
import fileTransWeb from "./image/file-trans-web.svg";
import fileTransImg from "./image/file-trans-img.svg";
import Video from "./image/video.svg";
import Audio from "./image/audio.svg";
import { v4 as uuidv4 } from "uuid";
// const { message, Popover, Upload } = Antd;

type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
    // stsToken: string;
};

export enum UploadType {
    Image,
    Video,
    Audio,
    Dynamic,
    Static,
    DynamicPlugin,
}

export type OssUploadButtonStates = {
    isActive: boolean,
    ossPercent: number,
    converterPercent: number,
    uploadState: PPTProgressPhase,
};

export const FileUploadStatic: string = ".doc,.docx,.ppt,.pptx,.pdf";

export type OssUploadButtonProps = {
    room: Room,
    oss: OSSConfigObjType,
    appIdentifier: string;
    sdkToken: string;
    whiteboardRef?: HTMLDivElement,
    callId: string;
    apiOrigin?: string;
    i18nLanguage?: string;
    region?: string;
    enables?: UploadType[];
    pptPlugin?: WhitePPTPlugin;
};

export default class OssUploadButton extends React.Component<OssUploadButtonProps, OssUploadButtonStates> {
    private readonly client: any;

    public constructor(props: OssUploadButtonProps) {
        super(props);
        this.state = {
            isActive: false,
            ossPercent: 0,
            converterPercent: 0,
            uploadState: PPTProgressPhase.Stop,
        };
        this.client = new OSS({
            accessKeyId: props.oss.accessKeyId,
            accessKeySecret: props.oss.accessKeySecret,
            region: props.oss.region,
            bucket: props.oss.bucket,
            // stsToken: props.oss.stsToken
        });
        message.config({
            top: 40,
        })
    }

    private uploadStatic = async (event: any): Promise<void> => {
        const { uuid } = this.props.room;
        const { callId } = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room, callId,this.props.apiOrigin, this.props.region);
        try {
            await uploadManager.convertFile(
                event.file,
                PPTKind.Static,
                this.props.oss.folder,
                uuid,
                this.props.sdkToken,
                callId,
                this.progress,
            );
        } catch (error) {
            message.error(error);
        }
    }

    private uploadPPTByPlugin = async (event: any): Promise<void> => {
        if (this.props.pptPlugin) {
            const { uuid } = this.props.room;
            const uploadManager = new UploadManager(this.client, this.props.room, this.props.apiOrigin, this.props.region);
            const pptUrl = await uploadManager.uploadFile(event.file, this.props.oss.folder, uuid, this.progress);
            const taskUUID = await this.props.pptPlugin?.convertPPT({
                url: pptUrl,
                onProgressUpdated: async (progress: number) => {
                    console.log(progress);
                    this.progress(PPTProgressPhase.Converting, progress / 100);
                    if (progress >= 100) {
                        this.progress(PPTProgressPhase.Stop, 1);
                        await this.props.pptPlugin?.loadPPT(taskUUID);
                        await this.props.pptPlugin?.gotoSlide(0);
                    }
                }
            });
        }
    }

    private uploadDynamic = async (event: any): Promise<void> => {
        const { uuid } = this.props.room;
        const { callId } = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room, this.props.apiOrigin, this.props.region);
        try {
            await uploadManager.convertFile(
                event.file,
                PPTKind.Dynamic,
                this.props.oss.folder,
                uuid,
                this.props.sdkToken,
                callId,
                this.progress,
            );
        } catch (error) {
            message.error(error);
        }
    }

    private progress = (phase: PPTProgressPhase, percent: number): void => {
        this.setState({ uploadState: phase });
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ ossPercent: percent * 100 });
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({ converterPercent: percent });
                break;
            }
            case PPTProgressPhase.Stop: {
                this.setState({ converterPercent: 0 });
                this.setState({ ossPercent: 0 });
            }
        }
    }

    public componentDidUpdate(prevProps: Readonly<OssUploadButtonProps>, prevState: Readonly<OssUploadButtonStates>, snapshot?: any) {
        if (this.state.uploadState !== prevState.uploadState) {
            if (this.state.uploadState === PPTProgressPhase.Uploading) {
                message.destroy();
                message.loading(this.translate(this.props.i18nLanguage, 'uploadingMessage'), 0);
            } else if (this.state.uploadState === PPTProgressPhase.Converting) {
                message.destroy();
                message.loading(this.translate(this.props.i18nLanguage, 'convertingMessage'), 0);
            } else {
                message.destroy();
            }
        }
    }

    private uploadImage = async (event: any): Promise<void> => {
        const {callId} = this.props;
        const uploadFileArray: File[] = [];
        const r = /image\/*/g;
        uploadFileArray.push(event.file);
        if(!r.test(event.file.type)){
             message.error(app.t("layout.facetime.whiteboard_tool_uploadFail"));
            return;
        }
        const uploadManager = new UploadManager(this.client, this.props.room, this.props.apiOrigin, this.props.region);
        try {
            if (this.props.whiteboardRef) {
                const { clientWidth, clientHeight } = this.props.whiteboardRef;
                await uploadManager.uploadImageFiles(
                    uploadFileArray,
                    clientWidth / 2,
                    clientHeight / 2,
                    callId,
                    this.progress,
                    this.props.oss.folder,
                    
                );
            } else {
                const clientWidth = window.innerWidth;
                const clientHeight = window.innerHeight;
                await uploadManager.uploadImageFiles(
                    uploadFileArray,
                    clientWidth / 2,
                    clientHeight / 2,
                    callId,
                    this.progress,
                    this.props.oss.folder
                );
            }
        } catch (error) {
            message.error(error);
        }
    }

    private getUrl = async (event: any): Promise<string> => {
        const {callId} = this.props;
        const folder = this.props.oss.folder;
        const uploadManager = new UploadManager(this.client, this.props.room,callId, this.props.apiOrigin, this.props.region);
        const res = await uploadManager.addFile(`/${folder ? folder + '/' : ''}${uuidv4()}/${event.file.name}`, event.file, this.progress);
        const isHttps = res.indexOf("https") !== -1;
        let url;
        if (isHttps) {
            url = res;
        } else {
            url = res.replace("http", "https");
        }
        return url;
    }

    private uploadVideo = async (event: any): Promise<void> => {
        const r = /video\/mp4/g;
        if(!r.test(event.file.type)){
             message.error(app.t("layout.facetime.whiteboard_tool_uploadFail"));
            return;
        }
        try {
            const url = await this.getUrl(event);
            if (url) {
                this.props.room.insertPlugin("video2", {
                    originX: -240,
                    originY: -135,
                    width: 480,
                    height: 270,
                    attributes: { src: url },
                    // attributes: { src: "https://vd4.bdstatic.com/mda-ndi46rn4z404r2a3/sc/cae_h264_delogo/1650337485233704861/mda-ndi46rn4z404r2a3.mp4?v_from_s=hkapp-haokan-hbe&auth_key=1650357817-0-0-ad879ce4f1bc925dd2ba7fb70d721495&bcevod_channel=searchbox_feed&pd=1&cd=0&pt=3&logid=0817107961&vid=17999624713628798608&abtest=100815_2-101454_3-17451_2&klogid=0817107961" },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    private uploadAudio = async (event: any): Promise<void> => {
        const r = /.mp3|audio*/g;
        if(!r.test(event.file.type)){
             message.error(app.t("layout.facetime.whiteboard_tool_uploadFail"));
            return;
        }
        try {
            const url = await this.getUrl(event);
            if (url) {
                this.props.room.insertPlugin("audio2", {
                    originX: -240,
                    originY: -43,
                    width: 480,
                    height: 86,
                    attributes: { src: url },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    private translate(lang: string | undefined, key: string) {
        if (lang === "zh-CN") {
            if (key === "uploadImage") return '上传图片';
            if (key === "uploadImageInner") return '支持 JPG、PNG 等常见格式';
            if (key === "uploadVideo") return '上传视频';
            if (key === "uploadVideoInner") return '支持 MP4 格式';
            if (key === "uploadAudio") return '上传音频';
            if (key === "uploadAudioInner") return '支持 MP3 格式';
            if (key === "documentToWebpage") return '文档转网页';
            if (key === "documentToWebpagePlugin") return '文档转网页[插件版]';
            if (key === "documentToWebpageInner") return '支持 PPTX 格式，如果是 PPT 格式，请手动转换';
            if (key === "documentToImage") return '文档转图片';
            if (key === "documentToImageInner") return '支持 PPT、PPTX、DOC、DOCX、PDF 格式';
            if (key === "uploadingMessage") return '正在上传';
            if (key === "convertingMessage") return '正在转码';
        } else {
            if (key === "uploadImage") return 'Upload Image';
            if (key === "uploadImageInner") return 'Supports common image formats like JPG and PNG.';
            if (key === "uploadVideo") return 'Upload Video';
            if (key === "uploadVideoInner") return 'Supports MP4 format.';
            if (key === "uploadAudio") return 'Upload Audio';
            if (key === "uploadAudioInner") return 'Supports MP3 format.';
            if (key === "documentToWebpage") return 'Document to Webpage';
            if (key === "documentToWebpagePlugin") return 'Document to Webpage[Plugin]';
            if (key === "documentToWebpageInner") return 'Only PPTX format is supported, For PPT files please convert to PPTX manually.';
            if (key === "documentToImage") return 'Document to Image';
            if (key === "documentToImageInner") return 'Supports PPT、PPTX、DOC、DOCX and PDF format.';
            if (key === "uploadingMessage") return 'Uploading...';
            if (key === "convertingMessage") return 'Converting...';
        }
        return '';
    }

    private renderUploadImage(): React.ReactNode {
        return (
            <Upload
                key="upload-image"
                accept={"image/*"}
                showUploadList={false}
                customRequest={this.uploadImage}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'uploadImage')}</div>
                            <div className="oss-upload-icon">
                                <img src={image} alt={"image"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">
                                {this.translate(this.props.i18nLanguage, 'uploadImageInner')}
                            </div>
                        </div>
                    </div>
                </div>
            </Upload>
        )
    }

    private renderUploadVideo(): React.ReactNode {
        return (
            <Upload
                key="upload-video"
                accept={"video/mp4"}
                showUploadList={false}
                customRequest={this.uploadVideo}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'uploadVideo')}</div>
                            <div className="oss-upload-icon">
                                <img src={Video} alt={"Video"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">{this.translate(this.props.i18nLanguage, 'uploadVideoInner')}</div>
                        </div>
                    </div>
                </div>
            </Upload>
        );
    }

    private renderUploadAudio(): React.ReactNode {
        return (
            <Upload
                key="upload-audio"
                accept={".mp3,audio/mp3"}
                showUploadList={false}
                customRequest={this.uploadAudio}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'uploadAudio')}</div>
                            <div className="oss-upload-icon">
                                <img src={Audio} alt={"Audio"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">{this.translate(this.props.i18nLanguage, 'uploadAudioInner')}</div>
                        </div>
                    </div>
                </div>
            </Upload>
        );
    }

    private renderUploadDynamic(): React.ReactNode {
        return (
            <Upload
                key="upload-dynamic"
                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"}
                showUploadList={false}
                customRequest={this.uploadDynamic}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'documentToWebpage')}</div>
                            <div className="oss-upload-icon">
                                <img src={fileTransWeb} alt={"fileTransWeb"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">{this.translate(this.props.i18nLanguage, 'documentToWebpageInner')}</div>
                        </div>
                    </div>
                </div>
            </Upload>
        );
    }

    private renderUploadDynamicPlugin(): React.ReactNode {
        return (
            <Upload
                key="upload-dynamic-plugin"
                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"}
                showUploadList={false}
                customRequest={this.uploadPPTByPlugin}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'documentToWebpagePlugin')}</div>
                            <div className="oss-upload-icon">
                                <img src={fileTransWeb} alt={"fileTransWeb"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">{this.translate(this.props.i18nLanguage, 'documentToWebpageInner')}</div>
                        </div>
                    </div>
                </div>
            </Upload>
        );
    }

    private renderUploadStatic(): React.ReactNode {
        return (
            <Upload
                key="upload-static"
                accept={FileUploadStatic}
                showUploadList={false}
                customRequest={this.uploadStatic}>
                <div className="oss-upload-section">
                    <div className="oss-upload-section-inner">
                        <div className="oss-upload-title-section">
                            <div className="oss-upload-title">{this.translate(this.props.i18nLanguage, 'documentToImage')}</div>
                            <div className="oss-upload-icon">
                                <img src={fileTransImg} alt={"fileTransImg"} />
                            </div>
                        </div>
                        <div className="oss-upload-section-script">
                            <div className="oss-upload-section-text">{this.translate(this.props.i18nLanguage, 'documentToImageInner')}</div>
                        </div>
                    </div>
                </div>
            </Upload>
        );
    }

    private renderUploadButton = (): React.ReactNode => {
        const enables = this.props.enables ?? [
            UploadType.Image,
            UploadType.Video,
            UploadType.Audio,
            // UploadType.Dynamic,
            // UploadType.Static,
            // UploadType.DynamicPlugin,
        ];
        return (
            <div className="oss-upload-box">
                {this.injectDividers(enables.map(type => {
                    if (type === UploadType.Image) return this.renderUploadImage();
                    if (type === UploadType.Video) return this.renderUploadVideo();
                    if (type === UploadType.Audio) return this.renderUploadAudio();
                    // if (type === UploadType.Dynamic) return this.renderUploadDynamic();
                    // if (type === UploadType.DynamicPlugin) return this.renderUploadDynamicPlugin();
                    // if (type === UploadType.Static) return this.renderUploadStatic();
                    return null;
                }))}
            </div>
        );
    }

    private renderDivider(key: number): React.ReactNode {
        return <div key={key} style={{ width: 208, height: 0.5, backgroundColor: "#E7E7E7" }} />;
    }

    private injectDividers(arr: React.ReactNode[]): React.ReactNode {
        let i = 1;
        const result: React.ReactNode[] = [];
        for (const e of arr) {
            result.push(e, this.renderDivider(i));
            i += 1;
        }
        result.pop();
        return result;
    }

    private handleVisibleChange = (event: boolean): void => {
        this.setState({ isActive: event })
    }

    public render(): React.ReactNode {
        const { isActive } = this.state;
        return (
            <>
                {/* <TopLoadingBar style={{ backgroundColor: "#71C3FC", height: 4 }} loadingPercent={this.state.ossPercent} />
                <TopLoadingBar style={{ backgroundColor: "#71C3FC", height: 4 }}
                    loadingPercent={this.state.converterPercent} /> */}
                <Popover trigger="hover"
                    key={"oss-upload-popper"}
                    onVisibleChange={this.handleVisibleChange}
                    placement={"leftBottom"}
                    content={this.renderUploadButton()}>
                    <div className="oss-upload-cell-box-left">
                        <div className="oss-upload-cell">
                            <img src={isActive ? uploadActive : upload} alt={"upload"} />
                        </div>
                    </div>
                </Popover>
            </>
        );
    }
}
