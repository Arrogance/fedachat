import { Howl } from 'howler';

export default {
    playBeepSound: function() {
        let sound = new Howl({
            src: ['/sounds/beep.wav'],
            volume: 0.2
        });

        sound.play();
    },

    playNotificationSound: function() {
        let sound = new Howl({
            src: ['/sounds/notification.wav'],
            volume: 0.2
        });

        sound.play();
    }
};
