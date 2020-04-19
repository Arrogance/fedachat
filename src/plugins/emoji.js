import toEmoji from 'emoji-name-map';
import unicodeEmoji from 'emoji-unicode';

const customMapping = {
    '<3': ':heart:',
    '</3': ':broken_heart:',
    ':)': ':smile:',
    ':(': ':slightly_frowning_face:',
    ':P': ':yum:',
    ':p': ':yum:',
    ':D': ':grinning:',
    ':d': ':grinning:',
    ':O': ':open_mouth:',
    ':o': ':open_mouth:',
    ':|': ':neutral_face:',
    ':/': ':unsure:',
    ':*': ':kissing_heart:',
    '(:': ':upside_down_face:',
    xD: ':rofl:',
    xd: ':rofl:'
};

export default {
    processText: function(text) {
        if (text === undefined) {
            return text;
        }

        text.split(' ').forEach(function(value) {
            if (value.length <= 1) {
                return text;
            }

            let originalValue = value;
            if (customMapping[value]) {
                value = customMapping[value];
            }

            try {
                let matches = value.match(/:(\w+):/gm);
                let match = matches[0];

                let emoji = toEmoji.get(match);
                if (emoji === undefined) {
                    return text;
                }

                let emojiCode = unicodeEmoji(emoji).split(' ');
                text = text.replace(originalValue, '&#x' + emojiCode[0]);
            } catch {}
        });

        return text;
    }
};
