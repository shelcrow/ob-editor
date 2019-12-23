<template>
    <div class="edit-node-container">
        <b-form>
            <b-form-group
                id="edit-node-name-input-group"
                label="Definition name:"
                label-for="node-name-input"
                v-if="!addingChild && !addingSubClass"
            >
                <b-form-input id="edit-node-name-input" v-model="$store.state.nodeName" disabled></b-form-input>
            </b-form-group>
            <b-form-group
                id="edit-node-type-input-group"
                label="Definition OAS type:"
                label-for="node-type-input"
                v-if="!addingChild && !addingSubClass"
            >
                <b-form-select id="edit-node-type-input" v-model="$store.state.nodeDataType" :options="dataTypes" :disabled="!preSubmit || addingChild"></b-form-select>
            </b-form-group>
            <b-form-group
                id="edit-node-description-input-group"
                label="Definition description:"
                label-for="node-description-input"
                v-if="!addingChild && !addingSubClass"
            >
                <b-form-input id="edit-node-description-input" v-model="$store.state.nodeDescription" :disabled="!preSubmit || addingChild"></b-form-input>
            </b-form-group>

            <div v-if="addingChild">
                <NodeSelector />
            </div>

            <div v-if="addingSubClass">
                <SuperClassSelector />
            </div>

            <span id="edit-form-buttons">
                <b-button v-if="$store.state.nodeDataType == 'object' && !addingChild && !addingSubClass" variant='secondary' @click="addChild">Add member</b-button>
                <!-- <b-button v-if="!addingChild && !addingSubClass" @click="addSubClassObject">Create Subclass</b-button> -->
                <b-button variant='primary' type="submit" @click.prevent="editNodeSubmit">
                    <span v-if='!addingChild && !addingSubClass'>Submit</span>
                    <span v-else-if='(addingChild || addingSubClass) && preSubmit'>Add</span>
                    <span v-else>Add another</span>
                </b-button>
                <!-- <b-button v-if="addingChild" variant='primary' type="submit" @click.prevent="editNodeSubmit">Add</b-button> -->
                <b-button variant='danger' @click="backToPrevView">Cancel</b-button>
                <!-- <b-alert :show="!preSubmit" variant="success" dismissible @dismissed="showDetailedView">
                    Edit was successful.
                </b-alert> -->
            </span>

        </b-form>
    </div>
</template>

<script>
import NodeSelector from "../NodeSelector.vue"
import SuperClassSelector from "../SuperClassSelector.vue"

export default {
    components: { NodeSelector, SuperClassSelector  },
    data() {
        return {
            preSubmit: true,
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object'],
            addingChild: false,
            addingSubClass: false,
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
        backToPrevView() {
            if (this.addingChild || this.addingSubClass) {
                this.preSubmit = true
                this.addingChild = false
                this.addingSubClass = false
            } else {
                this.$store.state.showDetailedView = true
                this.$store.state.showEditNodeView = false
                this.$store.state.nameRef = ''
            }

        },
        editNodeSubmit() {
            this.preSubmit = false
            if (this.addingChild) {
                this.$store.commit("addNodeToObject")
                this.$store.commit("setAddNodeToObjectToNone")
            } else if (this.addingSubClass) {
                this.$store.commit("addSuperClassToObject")
                this.$store.state.superClassToAddToObject = ''
            } else {
                this.$store.commit("editNode")
            }
        },
        addChild() {
            this.addingChild = true
            this.$store.commit("updateFlatNodes")
        },
        addSubClassObject() {
            this.addingSubClass = true
            this.$store.commit("updateFlatObjNodes")
        }
    },
    computed: {

    },
    watch: {
        "$store.state.showEditNodeView"() {
            this.addChildButton = true
            this.addingChild = false
            if (!this.preSubmit) {
                this.preSubmit = true
                // this.$store.commit("selectNone")
            }
        },
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