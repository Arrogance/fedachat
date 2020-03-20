<template>
    <section id="videos">
        <b-container fluid="">
            <b-row>
                <b-col cols="12">
                    <div id="video-canvas"></div>

                    123
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
    import {log} from "../../agora/src/utils/Logger";

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
                mainStream: null
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
                    displayMode: 1, // 0 Tile, 1 PIP, 2 screen share
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
            addStream: (stream, push = false) => {
                let id = stream.getId();
                // Check for redundant
                let redundant = this.streamList.some(item => {
                    return item.getId() === id;
                });

                if (redundant) {
                    return;
                }
                // Do push for localStream and unshift for other streams
                push ? this.streamList.push(stream) : this.streamList.unshift(stream);
                if (this.streamList.length > 4) {
                    options.displayMode = options.displayMode === 1 ? 0 : options.displayMode;
                    ButtonControl.disable([".displayModeBtn", ".disableRemoteBtn"]);
                }

                Renderer.customRender(this.streamList, options.displayMode, this.mainId);
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

            this.clientInit(Client, this.clientOptions).then(uid => {
                let config = isSafari()
                    ? {}
                    : {
                        cameraId: this.clientOptions.cameraId,
                        microphoneId: this.clientOptions.microphoneId
                    };

                const localStream = this.streamInit(uid, this.clientOptions, config);

                // Enable dual stream
                if (this.clientOptions.attendeeMode !== "audience") {
                    // MainId default to be localStream's ID
                    this.mainId = uid;
                    this.mainStream = localStream;
                }

                this.enableDualStream(Client);

                localStream.init(
                    () => {
                        if (options.attendeeMode !== "audience") {
                            this.addStream(localStream, true);
                            Client.publish(localStream, err => {
                                log("Publish local stream error: " + err);
                            });
                        }
                    },
                    err => {
                        log("getUserMedia failed", err);
                    }
                );

                console.log(localStream);
            });
        }
    }
</script>
