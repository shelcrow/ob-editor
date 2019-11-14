<template>
    <div class="edit-node-container">
        <b-form>
            <b-form-group
                id="node-name-input-group"
                label="Element name:"
                label-for="node-name-input"
            >
                <b-form-input id="node-name-input" v-model="$store.state.nodeName" disabled></b-form-input>
            </b-form-group>
            <b-form-group
                id="node-type-input-group"
                label="Element type:"
                label-for="node-type-input"
            >
                <b-form-select id="node-type-input" v-model="$store.state.nodeDataType" :options="dataTypes" :disabled="!preSubmit || addingChild"></b-form-select>
            </b-form-group>
            <b-form-group
                id="node-description-input-group"
                label="Element description:"
                label-for="node-description-input"
            >
                <b-form-input id="node-description-input" v-model="$store.state.nodeDescription" :disabled="!preSubmit || addingChild"></b-form-input>
            </b-form-group>

            <div v-if="addingChild">
                <NodeSelector />
            </div>

            <span id="edit-form-buttons">
                <b-button v-if="$store.state.nodeDataType == 'object' && addChildButton" variant='secondary' @click="addChild">Add child</b-button>
                <b-button v-if="preSubmit" variant='primary' type="submit" @click.prevent="editNodeSubmit">Submit</b-button>
                <b-button v-if="preSubmit" variant='danger' @click="showDetailedView">Cancel</b-button>
                <b-alert :show="!preSubmit" variant="success" dismissible @dismissed="showDetailedView">
                    Edit was successful.
                </b-alert>
            </span>

        </b-form>
    </div>
</template>

<script>
import NodeSelector from "../NodeSelector.vue"

export default {
    components: { NodeSelector },
    created() {

    },
    data() {
        return {
            preSubmit: true,
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object'],
            addChildButton: true,
            addingChild: false
        }
    },
    methods: {
        showDetailedView() {
            this.preSubmit = true
            this.$store.commit("selectNone")
            this.$store.commit("showDetailedView")
            this.addChildButton = true
            this.addingChild = false
        },
        editNodeSubmit() {
            this.preSubmit = false
            if (this.addingChild) {
                this.$store.commit("addNodeToObject")
            } else {
                this.$store.commit("editNode")
            }
        },
        addChild() {
            console.log("add child")
            this.addChildButton = false
            this.addingChild = true
        }
    },
    computed: {

    },
    watch: {
        "$store.state.isSelected"() {
            this.addChildButton = true
            this.addingChild = false
            if (!this.preSubmit) {
                this.preSubmit = true
                this.$store.commit("selectNone")
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