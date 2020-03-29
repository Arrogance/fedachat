<template>
    <section id="app-videos">
        <b-container fluid="">
            <b-row class="mt-4">
                <app-stream v-for="stream in streamList" v-bind:stream-source="stream" v-bind:key="stream.getId()"></app-stream>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import AgoraRTC from 'agora-rtc-sdk';
    import {
        AGORA_SHARE_ID,
        AGORA_RESOLUTION_ARR,
        AGORA_APP_ID,
        AGORA_TOKEN
    } from '../../config';
    import {log} from '../plugins/logger';

    AgoraRTC.Logger.disableLogUpload();
    AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.WARNING);

    import StreamComponent from './stream.vue';

    export default {
        props: {
            videoProfile: {
                type: String,
                default() {
                    return '720p_3'
                }
            },
            videoProfileLow: {
                type: String,
                default() {
                    return ''
                }
            },
            channel: String,
        },
        components: {
            'app-stream': StreamComponent
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
                videoDevice: null,
                audioDevice: null,
                localStream: null,
                videoStream: null,
            }
        },
        methods: {
            optionsInit: (options) => {
                return {
                    videoProfile: options.videoProfile.split(',')[0] || '720p_3',
                    videoProfileLow: options.videoProfileLow.split(',')[0] || '720p_3',
                    channel: options.channel || "test",
                    transcode: options.transcode || "rtc",
                    attendeeMode: options.attendeeMode || "video",
                    baseMode: options.baseMode || "avc",
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
                                client.setLowStreamParameter({
                                    width: lowStreamParam[0],
                                    height: lowStreamParam[1],
                                    framerate: lowStreamParam[2],
                                    bitrate: lowStreamParam[3]
                                });
                                // Create localstream
                                client.enableDualStream();
                                resolve(uid);
                            },
                            err => {
                                reject(err);
                            }
                        );
                    });
                });
            },
            streamInit: (uid, options) => {
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

                return AgoraRTC.createStream(Object.assign(defaultConfig, options));
            },
            addStream: (stream, push = false, _this) => {
                let id = stream.getId();
                let redundant = _this.streamList.some(item => {
                    return item.getId() === id;
                });

                if (false === redundant) {
                    push ? _this.streamList.push(stream) : _this.streamList.unshift(stream);
                }
            },
            removeStream: (id, _this) => {
                _this.streamList.map((item, index) => {
                    if (item.getId() === id) {
                        _this.streamList[index].close();
                        _this.streamList.splice(index, 1);
                        return 1;
                    }
                    return 0;
                });
            },
            subscribeStreamEvents: (client, _this) => {
                client.on("stream-added", function(evt) {
                    let stream = evt.stream;
                    let id = stream.getId();

                    if (id === AGORA_SHARE_ID) {
                        _this.clientOptions.displayMode = 2;
                        _this.mainId = id;
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

                    _this.removeStream(evt.uid, _this);
                });

                client.on("stream-subscribed", function(evt) {
                    let stream = evt.stream;

                    _this.addStream(stream, false, _this);
                });

                client.on("stream-removed", function(evt) {
                    let stream = evt.stream;

                    _this.removeStream(stream.getId(), _this);
                });
            },
            setDevice: function() {
                return new Promise((resolve, reject) => {
                    let options = this.clientOptions;

                    if (null === this.videoDevice && null === this.audioDevice) {
                        // throw error
                        return;
                    }

                    if (null === this.videoDevice) {
                        options.attendeeMode = 'audio-only'
                    } else {
                        options.cameraId = this.videoDevice.deviceId;
                    }

                    options.microphoneId = this.audioDevice.deviceId;

                    this.videoStream = this.streamInit(this.clientUid, options);
                    this.videoStream.setVideoProfile(
                        this.clientOptions.videoProfile
                    );

                    this.videoStream.init(
                        () => {
                            this.addStream(this.videoStream, true, this);
                            if (null !== this.videoStream.getId()) {
                                this.client.publish(this.videoStream);
                            }
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

            this.clientOptions = Object.assign(this.clientOptions, this.optionsInit({
                videoProfile: this.videoProfile,
                videoProfileLow: this.videoProfileLow,
                channel: this.channel,
                transcode: this.transcode,
                baseMode: this.baseMode,
                attendeeMode: this.attendeeMode,
            }));

            this.client = AgoraRTC.createClient({
                mode: this.clientOptions.transcode
            });

            this.subscribeStreamEvents(this.client, this);

            this.clientInit(this.client, this.clientOptions).then(uid => {
                this.clientUid = uid;
            });

            this.$root.$on('start_broadcasting', function() {
                _this.setDevice().then(function() {
                    _this.$root.$emit('user_started_broadcasting', _this.clientUid);
                });
            });

            this.$root.$on('stop_broadcasting', function() {
                _this.videoStream && _this.videoStream.close();
                _this.client && _this.client.unpublish(_this.videoStream);

                _this.removeStream(_this.clientUid, _this);

                _this.$root.$emit('video_reset');
                _this.$root.$emit('audio_reset');

                _this.$root.$emit('stopped_broadcasting');
            });

            this.$root.$on('self_muted', function() {
                _this.videoStream.isAudioOn()
                    ? _this.videoStream.muteAudio()
                    : _this.videoStream.unmuteAudio();
            });

            this.$root.$on('camera_selected', function(device) {
                _this.videoDevice = device;
            });

            this.$root.$on('audio_selected', function(device) {
                _this.audioDevice = device;
            });

            let clickListener = document.addEventListener('click', function(event) {
                if (_this.streamList) {
                    _this.streamList.forEach(function(stream) {
                        stream.resume()
                    });

                    event.target.removeEventListener('click', clickListener);
                }
            });
        }
    }
</script>
