const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

import { AGORA_APP_ID, AGORA_APP_CERT, AGORA_CHANNEL_NAME } from '../config';

export default class AgoraToken {
    generateToken(uuid) {
        const expirationTimeInSeconds = 3600 * 24;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const role = RtcRole.PUBLISHER;

        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        return RtcTokenBuilder.buildTokenWithUid(
            AGORA_APP_ID,
            AGORA_APP_CERT,
            AGORA_CHANNEL_NAME,
            uuid,
            role,
            privilegeExpiredTs
        );
    }
}
