<!-- 
Is the parent of all the editing components
-->

<template>
    <div class="edit-node-container">

        <component :is="changeEditingView">
        </component>

        <span class="edit-form-buttons">
            <b-button class="edit-btn" v-if="currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="editDefinition">
                Edit Attributes
            </b-button>
            <b-button class="edit-btn" v-if="$store.state.nodeDataType == 'object' && currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="addMember">
                Add member
            </b-button>
            <b-button class="edit-btn" v-if="$store.state.nodeDataType == 'object' && currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="addInheritance">
                Add Inheritance
            </b-button>
            <b-button class="edit-btn" v-if="$store.state.nodeDataType == 'object' && currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="removeInheritance">
                Remove Inheritance
            </b-button>
            <b-button class="edit-btn" v-if="$store.state.nodeDataType != 'object' && currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="addEnum">
                Add Enumeration
            </b-button>
            <b-button class="edit-btn" v-if="$store.state.nodeDataType != 'object' && currentEditingView == 'EditDefinitionFormDisabled'" variant='secondary' @click="removeEnum">
                Remove Enumeration
            </b-button>
        </span>
        <br/>
        <span class="previous-view-button">
            <b-button variant='danger' @click="backToPrevView">Back</b-button>
        </span>
    </div>
</template>

<script>
import AddInheritance from "./AddInheritance.vue"
import AddMember from "./AddMember.vue"
import EditDefinitionForm from "./EditDefinitionForm.vue"
import EditDefinitionFormDisabled from "./EditDefinitionFormDisabled.vue"
import RemoveInheritance from "./RemoveInheritance.vue"
import AddEnum from "./AddEnum.vue"
import RemoveEnum from "./RemoveEnum.vue"

import * as JSONEditor from "../../utils/JSONEditor.js"
import * as miscUtilities from "../../utils/miscUtilities.js"

export default {
    components: { AddInheritance, AddMember, EditDefinitionForm, EditDefinitionFormDisabled, RemoveInheritance, AddEnum, RemoveEnum  },
    data() {
        return {
            preSubmit: true,
            dataTypes: ['string', 'number', 'integer', 'boolean', 'array', 'object'],
            addingChild: false,
            addingSubClass: false,
            removingInheritance: false,
            formChanged: false,

            // variables added after refactoring 1/15/20
            currentEditingView: "EditDefinitionFormDisabled",
        }
    },
    methods: {
        showDetailedView() {
            this.preSubmit = true
            this.$store.commit("selectNone")
            this.$store.commit("showDetailedView")
            this.addMemberButton = true
            this.addingChild = false
        },
        backToPrevView() {
            if (this.currentEditingView == "EditDefinitionFormDisabled") {
                this.$store.state.showEditNodeView = false
                this.$store.state.showDetailedView = true
            } else {
                this.currentEditingView = "EditDefinitionFormDisabled"
            }
        },
        editNodeSubmit() {
            this.preSubmit = false
            if (this.addingChild) {
                this.$store.commit("addNodeToObject")
                this.$store.commit("setAddNodeToObjectToNone")
            } else if (this.addingSubClass) {
                this.$store.commit("addSuperClass")
                this.$store.state.superClassToAddToObject = ''
            } else if (this.removingInheritance) {

            } else {
                this.$store.commit("editNode")
            }
        },
        addMember() {
            this.currentEditingView = "AddMember"
            this.$store.commit("updateFlatNodes")
        },
        addInheritance() {
            this.currentEditingView = "AddInheritance"
        },
        removeInheritance() {
            this.currentEditingView = "RemoveInheritance"
        },
        editDefinition() {
            this.currentEditingView = "EditDefinitionForm"
        },
        addEnum() {
            this.currentEditingView = "AddEnum"
        },
        removeEnum() {
            this.currentEditingView = "RemoveEnum"
        }
    },
    computed: {
        // hasInheritance() {
        //     if (this.$store.state.isSelected) {
        //         return miscUtilities.hasInheritance(this.$store.state.schemaFile, this.$store.state.isSelected)
        //     } else {
        //         return false
        //     }
        // },
        // canInherit() {
        //     if (this.$store.state.isSelected) {
        //         return miscUtilities.canInherit(this.$store.state.schemaFile, this.$store.state.isSelected)
        //     } else {
        //         return false
        //     }
        // },
        changeEditingView() {
            return this.currentEditingView
        },
    },
    watch: {
        "$store.state.isSelected"() {
            this.currentEditingView = "EditDefinitionFormDisabled"
        }
    }
}
</script>

<style>
.previous-view-button {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -10px;
}

.edit-form-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.edit-btn {
    margin-bottom: 10px;
}
</style>