import { Howl, Howler } from 'howler';

export default {
    playSound: function(file) {
        let sound = new Howl({
            src: ['/sounds/beep.wav']
        });

        sound.play();
    }
};
