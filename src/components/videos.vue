<template>
    <section id="videos">
        <b-container fluid="">
            <b-row>
                <b-col cols="12">
                    <div id="video-canvas"></div>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import AgoraRTC from 'agora-rtc-sdk';
    import Renderer from '../plugins/render'
    import {
        isSafari,
        isMobileSize,
        isChrome,
        isFirefox
    } from "../plugins/browsercheck";
    import {
        AGORA_SHARE_ID,
        AGORA_RESOLUTION_ARR,
        AGORA_APP_ID,
        AGORA_TOKEN
    } from '../../config';
    import {log} from '../plugins/logger';

    export default {
        props: {
            videoProfile: {
                type: String,
                default() {
                    return '480p_4'
                }
            },
            videoProfileLow: {
                type: String,
                default() {
                    return ''
                }
            },
            cameraId: String,
            microphoneId: String,
            channel: String,
            transcode: {
                type: String,
                default() {
                    return 'interop'
                }
            },
            attendeeMode: {
                type: String,
                default() {
                    return 'video'
                }
            },
            baseMode: {
                type: String,
                default() {
                    return 'avc'
                }
            }
        },
        data() {
            return {
                client: {},
                clientOptions: {
                    key: AGORA_APP_ID,
                    token: AGORA_TOKEN
                },
                streamList: [],
                mainId: null,
                mainStream: null,
                localStream: null,
                shareClient: null,
                shareStream: null
            }
        },
        methods: {
            optionsInit: (options) => {
                return {
                    videoProfile: options.videoProfile.split(',')[0] || '480p_4',
                    videoProfileLow: options.videoProfileLow.split(',')[0] || '480p_4',
                    cameraId: options.cameraId,
                    microphoneId: options.microphoneId,
                    channel: options.channel || "test",
                    transcode: options.transcode || "interop",
                    attendeeMode: options.attendeeMode || "video",
                    baseMode: options.baseMode || "avc",
                    displayMode: 0, // 0 Tile, 1 PIP, 2 screen share
                    uid: undefined, // In default it is dynamically generated
                    resolution: undefined,
                }
            },
            clientInit: (client, options) => {
                return new Promise((resolve, reject) => {
                    client.init(options.key, () => {
                        let lowStreamParam = AGORA_RESOLUTION_ARR[options.videoProfileLow];
                        client.join(
                            options.token,
                            options.channel,
                            options.uid,
                            uid => {
                                log(uid, "brown", `User ${uid} join channel successfully`);
                                log(uid, "brown", new Date().toLocaleTimeString());
                                client.setLowStreamParameter({
                                    width: lowStreamParam[0],
                                    height: lowStreamParam[1],
                                    framerate: lowStreamParam[2],
                                    bitrate: lowStreamParam[3]
                                });
                                // Create localstream
                                resolve(uid);
                            },
                            err => {
                                reject(err);
                            }
                        );
                    });
                });
            },
            streamInit: (uid, options, config) => {
                let defaultConfig = {
                    streamID: uid,
                    audio: true,
                    video: true,
                    screen: false
                };

                switch (options.attendeeMode) {
                    case 'audio-only':
                        defaultConfig.video = false;
                        break;
                    case 'audience':
                        defaultConfig.video = false;
                        defaultConfig.audio = false;
                        break;
                    default:
                    case 'video':
                        break;
                }

                let stream = AgoraRTC.createStream(Object.assign(defaultConfig, config));
                stream.setVideoProfile(options.videoProfile);

                return stream;
            },
            enableDualStream: (client) => {
                client.enableDualStream(
                    function() {
                        log("Enable dual stream success!");
                    },
                    function(e) {
                        log(e);
                    }
                );
            },
            addStream: (stream, push = false, _this) => {
                let id = stream.getId();
                let redundant = _this.streamList.some(item => {
                    return item.getId() === id;
                });

                if (redundant) {
                    return;
                }

                // Do push for localStream and unshift for other streams
                push ? _this.streamList.push(stream) : _this.streamList.unshift(stream);
                if (_this.streamList.length > 4) {
                    _this.clientOptions.displayMode = _this.clientOptions.displayMode === 1 ? 0 : _this.clientOptions.displayMode;
                    // ButtonControl.disable([".displayModeBtn", ".disableRemoteBtn"]);
                }

                Renderer.customRender(_this.streamList, _this.clientOptions.displayMode, _this.mainId);
            },
            setHighStream: (prev, next, _this) => {
                if (prev === next) {
                    return;
                }

                let prevStream;
                let nextStream;

                // Get stream by id
                for (let stream of _this.streamList) {
                    let id = stream.getId();
                    if (id === prev) {
                        prevStream = stream;
                    } else if (id === next) {
                        nextStream = stream;
                    } else {
                        // Do nothing
                    }
                }

                // Set prev stream to low
                prevStream && _this.client.setRemoteVideoStreamType(prevStream, 1);
                // Set next stream to high
                nextStream && _this.client.setRemoteVideoStreamType(nextStream, 0);
            },
            getStreamById: id => {
                return this.streamList.filter(item => {
                    return item.getId() === id;
                })[0];
            },
            subscribeStreamEvents: (client, localStream, _this) => {
                client.on("stream-added", function(evt) {
                    let stream = evt.stream;
                    let id = stream.getId();
                    log("New stream added: " + id);
                    log(new Date().toLocaleTimeString());
                    log("Subscribe ", stream);
                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 2;
                        _this.mainId = id;
                        _this.mainStream = stream;
                        if (!_this.shareClient) {
                            // ButtonControl.disable(".shareScreenBtn");
                        }
                        // ButtonControl.disable([".displayModeBtn", ".disableRemoteBtn"]);
                    }

                    if (id !== _this.mainId) {
                        if (_this.clientOptions.displayMode === 2) {
                            client.setRemoteVideoStreamType(stream, 1);
                        } else {
                            _this.mainStream && client.setRemoteVideoStreamType(_this.mainStream, 1);
                            _this.mainStream = stream;
                            _this.mainId = id;
                        }
                    }
                    client.subscribe(stream, function(err) {
                        log("Subscribe stream failed", err);
                    });
                });

                client.on("peer-leave", function(evt) {
                    let id = evt.uid;
                    log("Peer has left: " + id);
                    log(new Date().toLocaleTimeString());
                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 0;
                        if (_this.clientOptions.attendeeMode === "video") {
                            // ButtonControl.enable(".shareScreenBtn");
                        }
                        // ButtonControl.enable([".displayModeBtn", ".disableRemoteBtn"]);
                        this.shareEnd();
                    }
                    if (id === _this.mainId) {
                        let next = _this.clientOptions.displayMode === 2 ? AGORA_SHARE_ID : _this.localStream.getId();
                        _this.setHighStream(_this.mainId, next, _this);
                        _this.mainId = next;
                        _this.mainStream = _this.getStreamById(_this.mainId);
                    }

                    this.removeStream(evt.uid);
                });

                client.on("stream-subscribed", function(evt) {
                    let stream = evt.stream;
                    log("Got stream-subscribed event");
                    log(new Date().toLocaleTimeString());
                    log("Subscribe remote stream successfully: " + stream.getId());
                    _this.addStream(stream, false, _this);
                });

                client.on("stream-removed", function(evt) {
                    let stream = evt.stream;
                    let id = stream.getId();
                    log("Stream removed: " + id);
                    log(new Date().toLocaleTimeString());
                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 0;
                        if (_this.clientOptions.attendeeMode === "video") {
                            // ButtonControl.enable(".shareScreenBtn");
                        }
                        // ButtonControl.enable([".displayModeBtn", ".disableRemoteBtn"]);
                        _this.shareEnd();
                    }

                    if (id === _this.mainId) {
                        let next = this.clientOptions.displayMode === 2 ? AGORA_SHARE_ID : localStream.getId();
                        _this.setHighStream(_this.mainId, next, _this);
                        _this.mainId = next;
                        _this.mainStream = _this.getStreamById(_this.mainId);
                    }

                    _this.removeStream(stream.getId());
                });
            },
            shareEnd: () => {
                try {
                    this.shareClient && this.shareClient.unpublish(this.shareStream);
                    this.shareStream && this.shareStream.close();
                    this.shareClient &&
                    this.shareClient.leave(
                        () => {
                            log("Share client succeed to leave.");
                        },
                        () => {
                            log("Share client failed to leave.");
                        }
                    );
                } finally {
                    this.shareClient = null;
                    this.shareStream = null;
                }
            },
            shareStart: () => {
                // ButtonControl.disable(".shareScreenBtn");
                this.shareClient = AgoraRTC.createClient({
                    mode: this.clientOptions.transcode
                });

                let shareOptions = Object.assign(this.clientOptions, {
                    uid: AGORA_SHARE_ID
                });

                this.clientInit(this.shareClient, shareOptions).then(uid => {
                    let config = {
                        screen: true,
                        video: false,
                        audio: false,
                        extensionId: "minllpmhdgpndnkomcoccfekfegnlikg",
                        mediaSource: "application"
                    };

                    this.shareStream = this.streamInit(uid, shareOptions, config);
                    this.shareStream.init(
                        () => {
                            // ButtonControl.enable(".shareScreenBtn");
                            this.shareStream.on("stopScreenSharing", () => {
                                this.shareEnd();
                                log("Stop Screen Sharing at" + new Date());
                            });
                            this.shareClient.publish(this.shareStream, err => {
                                log("Publish share stream error: " + err);
                                log("getUserMedia failed", err);
                            });
                        },
                        err => {
                            // ButtonControl.enable(".shareScreenBtn");
                            log("getUserMedia failed", err);
                            this.shareEnd();
                            if (isChrome()) {
                                // If (!chrome.app.isInstalled) {
                                let msg = `
            Please install chrome extension from
            <a href="https://chrome.google.com/webstore/detail/minllpmhdgpndnkomcoccfekfegnlikg">Google Webstore</a>
            before using sharing screen.
          `;
                                // Notify.danger(msg, 5000);
                                // }
                            }
                        }
                    );
                });
            }
        },
        mounted() {
            Renderer.init("video-canvas", 9 / 16, 8 / 5);
            if (isMobileSize()) {
                Renderer.enterFullScreen();
            }

            this.clientOptions = Object.assign(this.clientOptions, this.optionsInit({
                videoProfile: this.videoProfile,
                videoProfileLow: this.videoProfileLow,
                cameraId: this.cameraId,
                microphoneId: this.microphoneId,
                channel: this.channel,
                transcode: this.transcode,
                baseMode: this.baseMode,
                attendeeMode: this.attendeeMode,
            }));

            const Client = AgoraRTC.createClient({
                mode: this.clientOptions.transcode
            });

            this.client = Client;
            this.enableDualStream(Client);
            this.subscribeStreamEvents(Client, this.localStream, this);

            this.clientInit(Client, this.clientOptions).then(uid => {
                let config = isSafari()
                    ? {}
                    : {
                        cameraId: this.clientOptions.cameraId,
                        microphoneId: this.clientOptions.microphoneId
                    };

                this.localStream = this.streamInit(uid, this.clientOptions, config);

                // Enable dual stream
                if (this.clientOptions.attendeeMode !== "audience") {
                    // MainId default to be localStream's ID
                    this.mainId = uid;
                    this.mainStream = this.localStream;
                }

                this.localStream.init(
                    () => {
                        if (options.attendeeMode !== "audience") {
                            this.addStream(this.localStream, true, this);
                            Client.publish(this.localStream, err => {
                                log("Publish local stream error: " + err);
                            });
                        }
                    },
                    err => {
                        log("getUserMedia failed", err);
                    }
                );

                log(this.localStream);
            });
        }
    }
</script>
