<template>
    <section id="app-videos">
        <b-container fluid="">
            <b-row class="mt-4" v-if="this.$root.connected">
                <app-stream v-for="stream in streamList" v-bind:stream-source="stream" v-bind:key="stream.getId()" v-bind:client="client"></app-stream>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import AgoraRTC from 'agora-rtc-sdk';
    import {
        AGORA_SHARE_ID,
        AGORA_RESOLUTION_ARR,
        AGORA_APP_ID
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
                    return '480p_4'
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
                clientInitiated: false,
                clientUid: null,
                clientOptions: {
                    key: AGORA_APP_ID
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
                    videoProfile: options.videoProfile.split(',')[0] || '480p_4',
                    videoProfileLow: options.videoProfileLow.split(',')[0] || '480p_4',
                    channel: options.channel || "test",
                    transcode: options.transcode || "rtc",
                    attendeeMode: options.attendeeMode || "video",
                    baseMode: options.baseMode || "avc",
                    codec: "h264",
                    resolution: undefined,
                }
            },
            clientInit: (client, options, _this) => {
                return new Promise((resolve, reject) => {
                    client.init(options.key, () => {
                        let lowStreamParam = AGORA_RESOLUTION_ARR[options.videoProfileLow];
                        let tempProfile = AGORA_RESOLUTION_ARR[options.videoProfile];
                        options.resolution = tempProfile[0] / tempProfile[1] || 4 / 3;

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
                                _this.clientInitiated = true;
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
                        log('Stream Events', 'red', err);
                    });
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
                        options.attendeeMode = 'video';
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
                            resolve(this.videoStream.getId());
                        },
                        err => {
                            this.$root.$emit('stop_broadcasting');
                            log('Stream', 'red', 'Failed getUserMedia. Reason: '+ err);
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

            let clientInitCall = function(_this) {
                _this.clientInit(_this.client, _this.clientOptions, _this).then(uid => {
                    _this.clientUid = uid;
                    log('Client', 'blue', 'Client initiated');
                });
            };

            this.$root.$on('socket_connected', function() {
                _this.client = AgoraRTC.createClient({
                    mode: _this.clientOptions.transcode
                });

                _this.subscribeStreamEvents(_this.client, _this);

                let clickListener = document.addEventListener('click', function(event) {
                    if (_this.streamList) {
                        _this.streamList.forEach(function(stream) {
                            stream.resume()
                        });

                        _this.$root.audioEnabled = true;
                        event.target.removeEventListener('click', clickListener);
                    }
                });

                _this.$root.$on('username_changed', function() {
                    if (_this.$root.forceNewUserNameOnJoin === true && _this.$root.userNameChangedTwice === false) {
                        _this.$root.userNameChangedTwice = true;
                        if (_this.clientInitiated === false) {
                            clientInitCall(_this);
                        }
                    }
                });

                _this.$root.$on('user_stream_token', function(streamToken) {
                    _this.clientOptions.token = streamToken;
                    _this.clientOptions.uid = _this.$root.user.uuid;
                    if (_this.clientInitiated === false && _this.$root.userNameChangedTwice === true) {
                        clientInitCall(_this);
                    }
                });

                _this.$root.socket.on('stop_streaming', function(user) {
                    _this.removeStream(user.streamId, _this);

                    if (_this.$root.user && _this.$root.user.streamId === user.streamId) {
                        _this.$root.$emit('video_reset');
                        _this.$root.$emit('audio_reset');

                        _this.$root.$emit('stopped_broadcasting');
                    }
                });

                _this.$root.$on('start_broadcasting', function() {
                    _this.setDevice().then(function(uid) {
                        _this.$root.$emit('user_started_broadcasting', uid);
                    });
                });

                _this.$root.$on('stop_broadcasting', function() {
                    _this.videoStream && _this.videoStream.close();
                    _this.client && _this.client.unpublish(_this.videoStream);

                    _this.removeStream(_this.clientUid, _this);

                    _this.$root.$emit('video_reset');
                    _this.$root.$emit('audio_reset');

                    _this.$root.$emit('stopped_broadcasting');
                });

                _this.$root.$on('self_muted', function() {
                    _this.videoStream.isAudioOn()
                        ? _this.videoStream.muteAudio()
                        : _this.videoStream.unmuteAudio();
                });

                _this.$root.$on('self_paused', function() {
                    _this.videoStream.isVideoOn()
                        ? _this.videoStream.muteVideo()
                        : _this.videoStream.unmuteVideo();
                });

                _this.$root.$on('camera_selected', function(device) {
                    _this.videoDevice = device;
                });

                _this.$root.$on('audio_selected', function(device) {
                    _this.audioDevice = device;
                });
            });
        }
    }
</script>
