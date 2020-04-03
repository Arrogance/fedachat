<template></template>

<script>
    const defaultMessages = function(content) {
        switch(content) {
            case 'admin_success':
                return 'Se ha conectado como admin.';
            case 'admin_error':
                return 'La contraseña proporcionada no es correcta.';
            case 'connection_successful':
                return 'Conectado al chat correctamente.';
            case 'disconnection':
                return 'Desconectado del chat.';
            case 'reconnecting':
                return 'Intentando reconectar al chat...';
            default:
                return content;
        }
    };

    export default {
        methods: {
            sendNotification: function(type, content, title, customOptions) {
                let options = {
                    variant: type,
                    noCloseButton: true
                };

                if (title !== undefined) {
                    options.title = title;
                }

                this.$bvToast.toast(defaultMessages(content), Object.assign(options, customOptions));
            }
        },
        mounted() {
            let _this = this;
            this.$root.socket.on('notification', function(event) {
                _this.sendNotification(event.type, event.content);
            });
        }
    }
</script>
