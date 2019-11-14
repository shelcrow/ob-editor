<template>
    <div class="edit-node-container">
        <b-form>
            <b-form-group
                id="node-name-input-group"
                label="Element name:"
                label-for="node-name-input"
            >
                <b-form-input id="node-name-input" v-model="objectName"></b-form-input>
            </b-form-group>
            <b-form-group
                id="node-type-input-group"
                label="Element type:"
                label-for="node-type-input"
            >
                <b-form-input id="node-type-input" v-model="objectType" disabled></b-form-input>
            </b-form-group>
            <b-form-group
                id="node-description-input-group"
                label="Element description:"
                label-for="node-description-input"
            >
                <b-form-input id="node-description-input" v-model="objectDescription"></b-form-input>
            </b-form-group>
            <div v-for="(elementForm, index) in elementForms" :key="index" class="addedElementFormGroup">
                <b-button @click="removeElementForm(index)">Remove element</b-button>
                <b-button @click="toggleAddExistingElementFormInput" v-if="!showAddExistingElementFormInput">Add existing element</b-button>

                <b-form-group
                    id="node-name-input-group"
                    label="Element name:"
                    label-for="node-name-input"
                    v-if="!showAddExistingElementFormInput"
                >
                    <b-form-input id="node-name-input" v-model="elementForm.nodeName"></b-form-input>
                </b-form-group>
                <b-form-group
                    id="node-name-input-group"
                    label="Element name:"
                    label-for="node-name-input"
                    v-if="showAddExistingElementFormInput"
                >
                    <b-form-select id="node-type-input" v-model="elementForm.nodeName" :options="$store.state.listOfDefinitionElements" :disabled="!preSubmit"></b-form-select>
                </b-form-group>
                <b-form-group
                    id="node-type-input-group"
                    label="Element type:"
                    label-for="node-type-input"
                >
                    <b-form-select id="node-type-input" v-model="$store.state.objectType" :options="dataTypes" :disabled="!preSubmit"></b-form-select>
                </b-form-group>
                <b-form-group
                    id="node-description-input-group"
                    label="Element description:"
                    label-for="node-description-input"
                >
                    <b-form-input id="node-description-input" v-model="elementForm.nodeDescription"></b-form-input>
                </b-form-group>
            </div>
            <span id="edit-form-buttons">
                <b-button v-if="preSubmit" @click="addElementToObject">Add Element</b-button>
                <b-button v-if="preSubmit" @click.prevent="createObject" type="submit">Submit</b-button>
                <b-button v-if="preSubmit" @click="showDetailedView">Cancel</b-button>
            </span>
            <b-alert :show="!preSubmit" variant="success" dismissible @dismissed="showDetailedView">
                Create element was successful.
            </b-alert>

        </b-form>
    </div>
</template>

<script>
import Vue from "vue";

export default {
    data() {
        return {
            objectName: null,
            objectDescription: null,
            objectType: "object",
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object'],
            preSubmit: true,
            elementForms: [],
            showAddExistingElementFormInput: false

        }
    },
    methods: {
        showDetailedView() {
            this.preSubmit = true
            this.objectName = null
            this.objectDescription = null
            this.elementForms = []
            this.$store.commit("showDetailedView")
            this.showAddExistingElementFormInput = false
        },
        createObject() {
            let payload = {
                objectName: this.objectName,
                objectDescription: this.objectDescription,
                elementForms: this.elementForms
            }
            this.$store.commit("createNodeObject", payload)
            this.preSubmit = false
        },
        addElementToObject() {
            this.elementForms.push({
                nodeName: '',
                nodeType: '',
                nodeDescription: ''
            })
        },
        removeElementForm(index) {
            Vue.delete(this.elementForms, index);
        },
        toggleAddExistingElementFormInput() {
            this.showAddExistingElementFormInput = true
        }
    },
    computed: {

    },
    watch: {
        "$store.state.isSelected"() {
            this.objectName = null
            this.objectDescription = null
            this.elementForms = []
            this.showAddExistingElementFormInput = false

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

.addedElementFormGroup {
    border: 1px solid black;
    margin-bottom: 15px;
    padding: 2px;
}

</style>