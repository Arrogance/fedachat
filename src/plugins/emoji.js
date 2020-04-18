import toEmoji from 'emoji-name-map';
import unicodeEmoji from 'emoji-unicode';

const customMapping = {
    '<3': 'heart',
    ':)': 'smile',
    ':(': 'slightly_frowning_face',
    ':P': 'yum',
    ':p': 'yum',
    ':D': 'grinning',
    ':d': 'grinning',
    ':O': 'open_mouth',
    ':o': 'open_mouth',
    ':|': 'neutral_face',
    ':/': 'unsure',
    ':*': 'kissing_heart',
    '(:': 'upside_down_face',
    xD: 'rofl',
    xd: 'rofl'
};

export default {
    processText: function(text) {
        text.split(' ').forEach(function(value) {
            if (value.length <= 1) {
                return;
            }

            let firstChar = value[0];
            let lastChar = value[value.length - 1];

            if (
                undefined === customMapping[value] &&
                (firstChar !== ':' || lastChar !== ':')
            ) {
                return;
            }

            console.log(value);
            let emoji = toEmoji.get(value) || toEmoji.get(customMapping[value]);
            if (emoji === undefined) {
                return;
            }

            let emojiCode = unicodeEmoji(emoji).split(' ');
            text = text.replace(value, '&#x' + emojiCode[0]);
        });

        return text;
    }
};