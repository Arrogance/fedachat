<template>
    <div v-if="!this.isHidden">
        <div class="filter">
            <div class="dropdown">
                <ul class="suggestion-list">
                    <li v-for="(item, index) in matches" class="cursor pointer" @click="mentionUserName(item[1].userName)">
                        <strong><b-icon-person-plus></b-icon-person-plus> {{ item[1].userName }}</strong>
                    </li>
                </ul>
            </div>
        </div>
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
                inputData: String,
                isHidden: false
            }
        },

        methods: {
            mentionUserName: function(userName) {
                let ret = this.messageInput.$el.value.replace(/@\w{0,}$/, '');
                this.messageInput.$el.value = ret+"@"+userName;
                this.inputData = this.messageInput.$el.value;
                this.isHidden = true;
                this.$emit('update:inputData', this.inputData);
                this.messageInput.focus();
            }
        },
        computed: {
            matches () {
                let _this = this;
                let optionText = '';
                if (typeof _this.search !== 'undefined') {
                    return Object.entries(_this.options).filter(filterResult);

                    function filterResult(option) {
                        optionText = "@" + option[1].userName.toUpperCase();
                        return optionText.match(_this.search.toUpperCase());
                    }
                }
                _this.isHidden = false;
                return Object.entries(_this.options);
            }
        },

    }

</script>
