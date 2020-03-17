<template>
    <div class="create-element-container">
        <b-form>
            <b-form-group
                id="node-type-input-group"
                label="OB Definition type:"
                label-for="node-type-input"
            >
                <b-form-select id="node-type-input" v-model="definitionType" :options="OBDataTypes" :disabled="!preSubmit"></b-form-select>
            </b-form-group>
            <b-form-group
                id="node-name-input-group"
                label="Definition name:"
                label-for="node-name-input"
            >
                <b-form-input id="node-name-input" v-model="definitionName" :disabled="!preSubmit"></b-form-input>
            </b-form-group>
            <b-form-group
                id="node-description-input-group"
                label="Definition description:"
                label-for="node-description-input"
            >
                <b-form-input id="node-description-input" v-model="definitionDescription" :disabled="!preSubmit"></b-form-input>
            </b-form-group>
            <span id="edit-form-buttons">
                <b-button v-if="preSubmit" type="submit" @click.prevent="createElement">Create</b-button>
                <b-button v-if="preSubmit" @click="showDetailedView">Cancel</b-button>
                <!-- <b-alert :show="!preSubmit" variant="success" dismissible @dismissed="showDetailedView">
                    Create element was successful.
                </b-alert> -->
            </span>

        </b-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            definitionName: null,
            definitionType: null,
            definitionDescription: null,
            preSubmit: true,
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object'],
            OBDataTypes: ['OB Taxonomy Element', 'OB Object']

        }
    },
    methods: {
        showDetailedView() {
            this.definitionName = null
            this.definitionType = null
            this.definitionDescription = null
            this.preSubmit = true
            this.$store.commit("showDetailedView")
        },
        createElement() {
            let payload = {
                definitionName: this.definitionName,
                definitionType: this.definitionType,
                definitionDescription: this.definitionDescription
            }
            this.preSubmit = false

            this.$store.commit("createDefinition", payload)
        }
    },
    computed: {

    },
    watch: {
        "$store.state.isSelected"() {
            this.definitionType = null
            this.definitionName = null
            this.definitionDescription = null
            if (!this.preSubmit) {
                this.preSubmit = true
            }

        },
        "$store.state.refreshCreateDefn"() {
            if (this.$store.state.refreshCreateDefn == true) {
                this.definitionType = null
                this.definitionName = null
                this.definitionDescription = null
                if (!this.preSubmit) {
                    this.preSubmit = true
                }
                this.$store.commit("refreshCreateDefnInputs", false)
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

.create-element-container {
    padding-left: 15px;
    padding-right: 15px;
}

</style>