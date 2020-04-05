export const AGORA_SHARE_ID = 1;
export const AGORA_APP_ID = process.env.AGORA_APP_ID;
export const AGORA_APP_CERT = process.env.AGORA_APP_CERT;
export const AGORA_CHANNEL_NAME = process.env.AGORA_CHANNEL_NAME;
export const AGORA_RESOLUTION_ARR = {
    '120p,120p_1': [160, 120, 15, 65],
    '360p_4': [640, 360, 30, 600],
    '480p_4': [640, 480, 30, 750],
    '720p_3': [1280, 720, 30, 1710]
};

export const SOCKET_ENDPOINT = process.env.SOCKET_ENDPOINT;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

let appRequireUser =
    process.env.APP_REQUIRE_USER === undefined
        ? true
        : process.env.APP_REQUIRE_USER === 'true';

export const APP_REQUIRE_USER = appRequireUser;
