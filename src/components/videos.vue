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
                client: null,
                clientUid: null,
                clientOptions: {
                    key: AGORA_APP_ID,
                    token: AGORA_TOKEN
                },
                streamList: [],
                devices: []
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
                // if (_this.streamList.length > 4) {
                //     _this.clientOptions.displayMode = _this.clientOptions.displayMode === 1 ? 0 : _this.clientOptions.displayMode;
                //     // ButtonControl.disable([".displayModeBtn", ".disableRemoteBtn"]);
                // }

                Renderer.customRender(_this.streamList, _this.clientOptions.displayMode, _this.mainId);
            },
            removeStream: (id, _this) => {
                _this.streamList.map((item, index) => {
                    if (item.getId() === id) {
                        _this.streamList[index].close();
                        document.querySelector('#video-item-' + id).remove();
                        _this.streamList.splice(index, 1);
                        return 1;
                    }
                    return 0;
                });
                if (_this.streamList.length <= 4 && _this.clientOptions.displayMode !== 2) {
                    // ButtonControl.enable(".displayModeBtn");
                }

                Renderer.customRender(_this.streamList, _this.clientOptions.displayMode);
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
            getStreamById: (id, _this) => {
                return _this.streamList.filter(item => {
                    return item.getId() === id;
                })[0];
            },
            subscribeStreamEvents: (client, _this) => {
                client.on("stream-added", function(evt) {
                    let stream = evt.stream;
                    let mainStream;
                    let id = stream.getId();

                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 2;
                        _this.mainId = id;
                        mainStream = stream;
                    }

                    if (id !== _this.mainId) {
                        if (_this.clientOptions.displayMode === 2) {
                            client.setRemoteVideoStreamType(stream, 1);
                        } else {
                            mainStream && client.setRemoteVideoStreamType(mainStream, 1);
                            mainStream = stream;
                        }
                    }
                    client.subscribe(stream, function(err) {
                        log("Subscribe stream failed", err);
                    });
                });

                client.on("stream-removed", function(evt) {
                    _this.removeStream(evt.uid, _this);
                });

                client.on("peer-leave", function(evt) {
                    let id = evt.uid;

                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 0;
                    }

                    if (id === _this.mainId) {
                        // // if (null !== _this.localStream) {
                        //     let next = _this.clientOptions.displayMode === 2 ? AGORA_SHARE_ID : _this.localStream.getId();
                        //     _this.setHighStream(_this.mainId, next, _this);
                        //     _this.mainId = next;
                        //     _this.mainStream = _this.getStreamById(_this.mainId, _this);
                        // // }
                    }

                    _this.removeStream(evt.uid, _this);
                });

                client.on("stream-subscribed", function(evt) {
                    let stream = evt.stream;

                    _this.addStream(stream, false, _this);
                });

                client.on("stream-removed", function(evt) {
                    let stream = evt.stream;
                    let id = stream.getId();

                    if (id === _this.mainId) {
                        // if (null !== _this.localStream) {
                        //     let next = _this.clientOptions.displayMode === 2 ? AGORA_SHARE_ID : _this.localStream.getId();
                        //     _this.setHighStream(_this.mainId, next, _this);
                        //     _this.mainId = next;
                        //     _this.mainStream = _this.getStreamById(_this.mainId, _this);
                        // }
                    }

                    _this.removeStream(stream.getId(), _this);
                });
            },
            setDevice: function() {
                return new Promise((resolve, reject) => {
                    let id = this.localStream.getId();
                    this.client.unpublish(this.localStream);

                    // Reinit stream
                    let defaultConfig = {
                        streamID: id,
                        audio: true,
                        video: true,
                        screen: false,
                        cameraId: this.$root.cameraId,
                        microphoneId: this.$root.microphoneId
                    };

                    // eslint-disable-next-line
                    this.videoStream = AgoraRTC.createStream(defaultConfig);
                    this.videoStream.setVideoProfile(
                        this.clientOptions.videoProfile
                    );

                    // Init VIDEO
                    this.videoStream.init(
                        () => {
                            // if (!$("#enableVideo").prop("checked")) {
                            //     this.localStream.disableVideo();
                            // }
                            this.client.publish(this.videoStream);
                            resolve();
                        },
                        err => {
                            console.log("getUserMedia failed", err);
                            reject(err);
                        }
                    );
                });
            }
        },
        mounted() {
            let _this = this;

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

            this.client = AgoraRTC.createClient({
                mode: this.clientOptions.transcode
            });

            this.enableDualStream(this.client);
            this.subscribeStreamEvents(this.client, this);

            this.clientInit(this.client, this.clientOptions).then(uid => {
                this.clientUid = uid;
                // this.streamInit(uid, this.clientOptions);
            });

            this.$root.$on('start_broadcasting', function() {
                _this.localStream = _this.streamInit(_this.clientUid, _this.clientOptions);

                _this.localStream.init(
                    () => {
                        _this.addStream(_this.localStream, true, _this);
                        _this.client.publish(_this.localStream, err => {
                            log("Publish local stream error: " + err);
                        });
                    },
                    err => {
                        log("getUserMedia failed", err);
                    }
                );

                _this.setDevice();
            });

            this.$root.$on('stop_broadcasting', function() {
                _this.localStream && _this.localStream.close();
                _this.client && _this.client.unpublish(_this.localStream);

                _this.removeStream(_this.clientUid, _this);

                _this.$root.$emit('video_reset');
                _this.$root.$emit('audio_reset');

                _this.$root.$emit('stopped_broadcasting');
            });
        }
    }
</script>