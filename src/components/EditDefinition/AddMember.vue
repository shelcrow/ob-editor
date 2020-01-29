<!-- 
Component for adding members to objects
-->

<template>
    <div class="node-selector-container">
        <div class="source-checkboxes">
            <b-form-group label="Pick which list to select from:">
                <b-form-radio v-model="selectedElemLst" name="solar-taxonomy-radios" value="solar-taxonomy">Solar Taxonomy</b-form-radio>
                <b-form-radio v-model="selectedElemLst" name="OBOAS-radios" value="OBOAS">Your OB OAS File</b-form-radio>
            </b-form-group>
        </div>
        <b-form-group 
            id="node-selector-input-label"
            label="Choose definition to add to object:"
            label-for="node-selector-input"
        >
            <b-form-input v-model="searchTerm" placeholder="Search for definition..."></b-form-input>
        </b-form-group>
        <p>Members:</p>
        <div class="solar-taxonomy-node-list" v-if="selectedElemLst == 'solar-taxonomy'">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="memberToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
                {{ definition }}
            </li>
        </div>
        <div class="OBOAS-node-list" v-if="selectedElemLst == 'OBOAS'">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="memberToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
                {{ definition }}
            </li>
        </div>
        <b-table
            v-if="selectedElementDetails"
            stacked
            :items="selectedElementDetails"
            id="selectedElementTable"
            ref="selectedElementTable"
        ></b-table>
        <br />
        <div class="error-container">
            <span v-if="showErrorInfinite || showErrorConflict">
                <p id="error-msg" v-if="showErrorInfinite">Can't add this, will cause infinite loop error. Object or superclass contains the one you're trying to add</p>
                <p id="error-msg" v-if="showErrorConflict">Can't add this, will cause conflict error. Object or superclass is being referenced already</p>
            </span>
        </div>
        <div class="submit-button-container">
            <b-button variant="primary" @click="submitAddMember">
                <span v-if="!hasSubmitted">Add</span>
                <span v-else>Add another</span>
            </b-button>
        </div>
    </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities"

export default {
    data() {
        return {
            searchTerm: '',
            selectedIndex: null,
            selectedElementDetails: null,
            selectedElemLst: "OBOAS",
            definitionToAdd: '',
            memberType: '',
            memberDescrip: '',
            memberName: '',
            hasSubmitted: false,
            showErrorInfinite: false,
            showErrorConflict: false
        }
    },
    methods: {
        memberToAdd(index, definitionName) {
            this.selectedIndex = index;
            this.memberName = definitionName
            this.showErrorInfinite = false
            this.showErrorConflict = false

            if (this.selectedElemLst == "OBOAS") {
                if (this.$store.state.schemaFile[definitionName]["allOf"]) {
                    this.memberType = "object"
                } else {
                    this.memberType = this.$store.state.schemaFile[definitionName]["type"]
                }
                this.memberDescrip = this.$store.state.schemaFile[definitionName]["description"]
            } else if (this.selectedElemLst == "solar-taxonomy") {
                this.memberType = "string"
                this.memberDescrip = this.$store.state.xbrlFile[definitionName]["description"]
            }

            if (!this.memberDescrip) {
                this.memberDescrip = "Documentation not available"
            }

            let obj = {
                "Name": this.memberName,
                "Type": this.memberType,
                "Documentation": this.memberDescrip
            }

            let arr = []
            arr.push(obj)
            this.selectedElementDetails = arr
        },
        submitAddMember() {
            if (miscUtilities.checkInfiniteLoopErr(this.$store.state.schemaFile, this.$store.state.isSelected, this.memberName)) {
                this.showErrorInfinite = true
            } 

            if (miscUtilities.checkSuperClassObjConflict(this.$store.state.schemaFile, this.$store.state.isSelected, this.memberName)) {
                this.showErrorConflict = true
            }

            if (!this.showErrorInfinite && !this.showErrorConflict) {
                this.$store.commit({
                    type: 'addNodeToObject',
                    defnName: this.$store.state.isSelected,
                    memberName: this.memberName,
                    memberType: this.memberType,
                    elemList: this.selectedElemLst
                })
                this.hasSubmitted = true
            }
        },
    },
    computed: {
        filteredList() {
            if (this.selectedElemLst == "OBOAS") {
                return this.$store.state.allNodesFlat.filter( node => {
                    if ( node.toLowerCase() != this.$store.state.isSelected.toLowerCase() ) {
                        return node.toLowerCase().includes(this.searchTerm.toLowerCase())
                }}).sort()
            } else {
                return this.$store.state.xbrlFlat.filter( node => {
                    if ( node.toLowerCase() != this.$store.state.isSelected.toLowerCase() ) {
                        return node.toLowerCase().includes(this.searchTerm.toLowerCase())
                }}).sort()
            }
        },
        solarTaxonomyState() {
            if (this.showOBOAS) {
                return false
            }
        },
        OBOASState() {
            if (this.showSolarTaxonomy) {
                return false
            }
        }
    },
    watch: {
        selectedElemLst() {
            this.selectedIndex = null;
            this.searchTerm = ''
        }
    }
}
</script>

<style>
.OBOAS-node-list {
    height: 250px;
    overflow-y: auto;
    background-color: white;
    border-top: 1px solid black;
    border-left: 1px solid black;
    border-right: 1px solid black;
    margin-bottom: 4px;

}

.solar-taxonomy-node-list {
    height: 250px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid black;
    margin-bottom: 4px;
}

.node-in-list {
    list-style: none;
    border-bottom: 1px solid black;
}

.selected-node {
    background-color: #89CFF0;
}

.source-checkboxes {
    margin-bottom: 15px;
}

.submit-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

#error-msg {
    color: red;
    font-weight: bold;
}
</style>
