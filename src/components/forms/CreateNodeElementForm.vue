<template>
    <div class="create-element-container">
        <b-form>
            <b-form-group
                id="node-name-input-group"
                label="Element name:"
                label-for="node-name-input"
            >
                <b-form-input id="node-name-input" v-model="nodeElementName" :disabled="!preSubmit"></b-form-input>
            </b-form-group>
            <b-form-group
                id="node-type-input-group"
                label="Element type:"
                label-for="node-type-input"
            >
                <b-form-select id="node-type-input" v-model="$store.state.elementType" :options="dataTypes" :disabled="!preSubmit"></b-form-select>
            </b-form-group>
            <b-form-group
                id="node-description-input-group"
                label="Element description:"
                label-for="node-description-input"
            >
                <b-form-input id="node-description-input" v-model="nodeElementDescription" :disabled="!preSubmit"></b-form-input>
            </b-form-group>
            <span id="edit-form-buttons">
                <b-button v-if="preSubmit" type="submit" @click.prevent="createElement">Create</b-button>
                <b-button v-if="preSubmit" @click="showDetailedView">Cancel</b-button>
                <b-alert :show="!preSubmit" variant="success" dismissible @dismissed="showDetailedView">
                    Create element was successful.
                </b-alert>
            </span>

        </b-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            nodeElementName: null,
            nodeElementType: null,
            nodeElementDescription: null,
            preSubmit: true,
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object']

        }
    },
    methods: {
        showDetailedView() {
            this.nodeElementName = null
            this.nodeElementType = null
            this.nodeElementDescription = null
            this.preSubmit = true
            this.$store.commit("showDetailedView")
        },
        createElement() {
            let payload = {
                nodeName: this.nodeElementName,
                nodeType: this.nodeElementType,
                nodeElementDescription: this.nodeElementDescription
            }
            this.preSubmit = false

            this.$store.commit("createNodeElement", payload)
        }
    },
    computed: {

    },
    watch: {
        "$store.state.isSelected"() {
            this.nodeElementType = null
            this.nodeElementName = null
            this.nodeElementDescription = null
            if (!this.preSubmit) {
                this.preSubmit = true
            }

        }
    }
}

</script>

<style>
#edit-form-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>