import { Howl, Howler } from 'howler';

export default {
    playBeepSound: function() {
        let sound = new Howl({
            src: ['/sounds/beep.wav'],
            volume: 0.2
        });

        sound.play();
    }
};
