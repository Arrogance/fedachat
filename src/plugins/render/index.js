export default {
    init(elementId) {
        this.canvas = document.querySelector(`#${elementId}`);
    },

    customRender(streamList) {
        for (let stream of streamList) {
            this.updateVideoItem(stream);
        }
    },

    updateVideoItem(stream) {
        let id = stream.getId();
        let dom = document.querySelector('#video-item-' + id);
        if (!dom) {
            let box = document.createElement('div');
            let userNameBox = document.createElement('span');

            dom = document.createElement('section');

            userNameBox.setAttribute('class', 'video-item-username rounded');
            userNameBox.setAttribute('data-user-stream-id', id);

            dom.setAttribute('id', 'video-item-' + id);
            dom.setAttribute('class', 'video-item col-4 mt-3');
            box.setAttribute('class', 'video-item-box');

            dom.appendChild(box);
            dom.appendChild(userNameBox);

            this.canvas.appendChild(dom);

            stream.play('video-item-' + id);
        }

        dom.querySelectorAll('div').forEach(e => {
            e.classList.add('rounded');
        });
    }
};
