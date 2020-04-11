<template>
    <div class="dropdown">
        <ul class="suggestion-list">
            <li v-for="(item, index) in matches" class="cursor pointer" @click="mentionUserName(item[1].userName)">
                <strong><b-icon-person-plus></b-icon-person-plus> {{ item[1].userName }}</strong>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        props: {
            value: null,
            options: {
                type: Array,
                required: false
            },
            search: {
                type: String,
                required: false
            },
            messageInput: {
                type: Object,
                required: false,
            }
        },
        data () {
            return {
                selectedOption: null,
                inputData: String
            }
        },

        methods: {
            mentionUserName: function(userName) {
                let ret = this.messageInput.$el.value.replace(/@\w{1,}$/, '');
                this.messageInput.$el.value = ret+"@"+userName;
                this.inputData = this.messageInput.$el.value
                this.$emit('update:inputData', this.inputData);
                this.messageInput.focus();
            }
        },
        computed: {
            matches () {
                return Object.entries(this.options).filter((option) => {
                    var optionText = "@"+option[1].userName.toUpperCase();
                    return optionText.match(this.search.toUpperCase())
                })
            }
        },

    }

</script>
