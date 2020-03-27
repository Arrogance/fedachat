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
            dom = document.createElement('section');
            let box = document.createElement('div');
            dom.setAttribute('id', 'video-item-' + id);
            dom.setAttribute('class', 'video-item col-4 mt-3');
            box.setAttribute('class', 'video-item-box');
            dom.appendChild(box);
            this.canvas.appendChild(dom);
            stream.play('video-item-' + id);
        }

        dom.querySelectorAll('div').forEach(e => {
            e.classList.add('rounded');
        });
    }
};
