import { Howl } from 'howler';
import App from '../app.js';

export default {
    playBeepSound: function() {
        let sound = new Howl({
            src: ['/sounds/beep.wav'],
            volume: 0.2
        });

        App.$data.chatSoundEnabled && sound.play();
    }
};
