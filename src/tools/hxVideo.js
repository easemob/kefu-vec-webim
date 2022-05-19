/*
@params
clientConfig 创建客户端的配置
onRemoteUserChange 远端用户对象change变化回调
onJoinstateChange 加入房间状体变化事件
onErrorNotify 错误回调
onUserJoined 用户加入回调 *（加入后不能立即播放 user上还没有 audioTrack videoTrack 需要在handleUserPublished 回调触发之后才可以）
onUserLeft 用户离开回调
*/
// import AgoraRTC from 'AgoraRTC';
import SegPlugin from "agora-rtc-plugin-virtual-background";
const func = () => void 0;

export default class HxVideo {

  constructor(config = {}) {
    let {
      clientConfig = { codec: 'h264', mode: 'live', role: 'host' },
        onRemoteUserChange = func,
        onErrorNotify = func,
        onUserJoined = func,
        onUserLeft = func
    } = config;

    this.config = config;
    this.client = AgoraRTC.createClient(clientConfig); //创建客户端
    AgoraRTC.loadModule(SegPlugin, {});// 加载虚拟背景插件
    this.joinState = false; //是否加入了频道
    this.remoteUsers = []; //远端客户对象
    this.localAudioTrack = null; //本地音频轨道
    this.localVideoTrack = null; //本地视频轨道
    this.localScreenTrack = null; //本地p屏幕轨道
    this.virtualBackgroundEnabled = false; // 虚拟背景是否开启


    this.onRemoteUserChange = onRemoteUserChange.bind(this); //远端用户change回调
    this.onErrorNotify = onErrorNotify.bind(this); // 错误回调
    this.onUserJoined = onUserJoined.bind(this); // 当前用户加入回调
    this.onUserLeft = onUserLeft.bind(this); // 当前用户离开回调

    this.handleUserPublished = this.handleUserPublished.bind(this);
    this.handleUserUnpublished = this.handleUserUnpublished.bind(this);
    this.handleUserJoined = this.handleUserJoined.bind(this);
    this.handleUserLeft = this.handleUserLeft.bind(this);

    this.bindClientListener();
  }

  createLocalAudioTrack(audioConfig) {

    return new Promise((resolve, reject) => {
      if (this.localAudioTrack)
        return void resolve(this.localAudioTrack);

      AgoraRTC.createMicrophoneAudioTrack(audioConfig)
        .then((localAudioTrack) => {
          this.localAudioTrack = localAudioTrack;
          resolve(localAudioTrack)
        })
        .catch(error => {
          this.onErrorNotify(error.code)
        })
    })
  }

  createLocalVideoTrack(videoConfig) {
    return new Promise((resolve, reject) => {
      if (this.localVideoTrack)
        return void resolve(this.localVideoTrack);

      AgoraRTC.createCameraVideoTrack(videoConfig)
        .then((localVideoTrack) => {
          this.localVideoTrack = localVideoTrack;
          resolve(localVideoTrack)
        })
        .catch(error => {
          this.onErrorNotify(error.code)
        })
    })
  }

  /* 创建本地音视频轨道 */
  createLocalTracks(audioConfig, videoConfig) {
    return new Promise((resolve, reject) => {
      if (this.localAudioTrack && this.localVideoTrack) {
        return resolve([this.localAudioTrack, this.localVideoTrack]);
      }
      AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig)
        .then(([microphoneTrack, cameraTrack]) => {
          this.localAudioTrack = microphoneTrack;
          this.localVideoTrack = cameraTrack;

          resolve([microphoneTrack, cameraTrack])
        })
        .catch(error => {
          this.onErrorNotify(error.code)
        })
    })
  }

  /* 创建用于屏幕共享的视频轨道 */
  createScreenVideoTrack(config) {
    return AgoraRTC.createScreenVideoTrack(config)
      .then(localScreenTrack => {
        this.localScreenTrack = localScreenTrack;
        return localScreenTrack;
      })
      .catch(error => {
        this.onErrorNotify(error.code)
      })
  }

  publish(...params) {
    this.client.publish(params);
  }

  /* audioConfig, videoConfig 创建本地音视频轨道的参数 */
  join({ appid, channel, token, uid, audioConfig, videoConfig }) {
    let _initVirtualBackgroundPromise = Promise.resolve();

    if (!this.client) return;

    return this.createLocalTracks(audioConfig, videoConfig)
      .then(([microphoneTrack, cameraTrack]) => {
        _initVirtualBackgroundPromise = this.initVirtualBackground();// 创建本地轨道后，就加载虚拟背景，否则打开虚拟背景时时间太长。
        return this.client.join(appid, channel, token || null, uid || undefined);
      })
      .then(() => {
        return this.publish(this.localAudioTrack, this.localVideoTrack);
      })
      .then(() => {
        this.setJoinState(true);
        return { promise: _initVirtualBackgroundPromise }
      })
      .catch((error) => {
        this.onErrorNotify(error.code);
      })
  }

  // 关闭本地音视频轨道
  closeLocalTrack(type) {
    switch (type) {
      case 'audio':
        return this.closeLocalAudioTrack();
      case 'video':
        return this.closeLocalVideoTrack();
      case 'screen':
        return this.closeLocalScreenTrack();
      default:
        return Promise.all([
          this.closeLocalAudioTrack(),
          this.closeLocalVideoTrack(),
          this.closeLocalScreenTrack(),
        ])
    }
  }

  // 关闭本地音频轨道
  closeLocalAudioTrack() {
    if (this.localAudioTrack) {
      this.client.unpublish(this.localAudioTrack)
        .then(() => {
          this.localAudioTrack?.stop();
          this.localAudioTrack?.close();
          this.localAudioTrack = void 0;
        })
    } else {
      return Promise.resolve();
    }
  }

  // 关闭本地视频轨道
  closeLocalVideoTrack() {
    if (this.localVideoTrack) {
      return this.client.unpublish(this.localVideoTrack)
        .then(() => {
          this.localVideoTrack?.stop();
          this.localVideoTrack?.close();
          this.localVideoTrack = void 0;
        })
    } else {
      return Promise.resolve();
    }
  }

  closeLocalScreenTrack() {
    if (this.localScreenTrack) {
      return this.client.unpublish(this.localScreenTrack)
        .then(() => {
          this.localScreenTrack?.stop();
          this.localScreenTrack?.close();
          this.localScreenTrack = void 0;
        })
    } else {
      return Promise.resolve();
    }
  }

  /* 离开 */
  leave() {
    this.closeLocalTrack();
    this.setRemoteUsers([]);
    this.setJoinState(false);
    return this.client.leave();
  }

  /* 设置加入状态 */
  setJoinState(value) {
    this.joinState = value;
  }

  /* 设置remoteUser 远端客户 */
  setRemoteUsers(users) {
    this.remoteUsers = users || Array.from(this.client.remoteUsers);
    this.onRemoteUserChange(this.remoteUsers);
  }

  /* 销毁函数 */
  destroy() {
    this.unBindClientListener();
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.localScreenTrack = null;
  }

  initVirtualBackground(){
    if(this.localVideoTrack){
      return this.initVirtualBackgroundPromise()
      .then((instance)=>{
        this.virtualBackgroundInstance = instance;
      })
      ["catch"](error => {
        this.onErrorNotify(error.code);
      });
    } else {
      return Promise.resolve();      
    }
  }

  initVirtualBackgroundPromise(){
		if(this.localVideoTrack){
			return SegPlugin.inject(this.localVideoTrack, "https://front-static.kefu.easemob.com/wasms");
		}
	}

  openVirtualBackground(option){
    return this.changeVirtualBackground(option);
  }

  closeVirtualBackground(){
    return this.changeVirtualBackground({ enable: false });
  }

  changeVirtualBackground(option){
    if(this.virtualBackgroundInstance){
      return this.virtualBackgroundInstance.setOptions(option)
      .then(()=>{
        this.virtualBackgroundEnabled = option.enable;
      })
      ["catch"](error => {
        this.onErrorNotify(error.code);
      });
    }
    else{
      return this.initVirtualBackground();
    }
  }

  /* 用户发布出发回调 */
  handleUserPublished(user, mediaType) {
    this.client.subscribe(user, mediaType)
      .then(() => {
        this.setRemoteUsers();
      })
      .catch((error) => {
        this.onErrorNotify(error.code);
      })
  }

  /* 用户取消发布触发回调 */
  handleUserUnpublished() {
    this.setRemoteUsers();
  }

  /* 用户加入回调 */
  handleUserJoined(user) {
    this.onUserJoined();
    this.setRemoteUsers();
  }

  /* 用户离开回调 */
  handleUserLeft(user) {
    this.setRemoteUsers();
    this.onUserLeft(user, this.remoteUsers);
  }

  /* 取消监听 */
  unBindClientListener() {
    this.client.off('user-published', this.handleUserPublished);
    this.client.off('user-unpublished', this.handleUserUnpublished);
    this.client.off('user-joined', this.handleUserJoined);
    this.client.off('user-left', this.handleUserLeft);
  }

  /* 添加监听 */
  bindClientListener() {
    if (!this.client) return;
    this.client.on('user-published', this.handleUserPublished);
    this.client.on('user-unpublished', this.handleUserUnpublished);
    this.client.on('user-joined', this.handleUserJoined);
    this.client.on('user-left', this.handleUserLeft);
  }
}
