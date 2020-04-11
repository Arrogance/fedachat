<template>
    <section id="terms">
        <b-container fluid="">
            <b-row>
                <b-col cols="12" class="mt-5 text-center">
                    <h2>Términos de Uso y Condiciones</h2>
                    <b-row>
                        <b-col cols="8" offset="2">
                            <p>Al usar el sitio web FedaChat, y/o otros productos y/o servicios, está aceptando los siguientes términos:</p>

                            <ul class="text-left">
                                <li>No usar el FedaChat si tienes menos de 13 años.</li>
                                <li>Si tienes menos de 18 años, usa FedaChat solo con el permiso de un padre o tutor legal.</li>
                                <li>No retransmitas desnudos, no acoses sexualmente a nadie, ni publicites información privada de otras personas (o de uno mismo), no violes derechos de propiedad intelectual.</li>
                            </ul>

                            <p>FedaChat se proporciona tal y como es, se ofrece sin ningún tipo de garantía, explícita o implícita. Los propietarios de FedaChat no serán responsables de cualquier daño directo o indirecto provocado del uso de FedaChat.</p>

                            <h3>Privacidad de Chat</h3>
                            <p>Todos los mensajes enviados al chat serán almacenados de forma temporal, no accesible por otras partes, durante el ciclo de vida habitual de FedaChat. Estos mensajes solo serán mostrados durante la sesión actual, siendo éstos innacesibles a nuevas sesiones.</p>

                            <h3>Políticas de Cookies</h3>
                            <p>Última revisión: 11/04/2020</p>

                            <p>Al aceptar estos términos y condiciones de uso está aceptando la posibilidad de que FedaChat almacene en forma de Cookies (o en el almacenamiento interno de su navegador) información necesaria para un correcto funcionamiento del sitio.</p>

                            <p>FedaChat no almacenará en ningún caso datos personales o sensibles en dichas Cookies (o en dichos datos almacenados).</p>

                            <p></p>
                            <b-button v-on:click="accept" variant="success">Aceptar y continuar</b-button>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script>
    import Storage from '../plugins/storage/storage.js'

    export default {
        methods: {
            accept: function() {
                Storage.set('terms', true);
                location.reload();
            }
        }
    }
</script>
