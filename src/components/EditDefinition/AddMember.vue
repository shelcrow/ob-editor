<!-- 
Component for adding members to objects
-->

<template>
    <div class="node-selector-container">
        <div class="source-checkboxes">
            <b-form-group label="Pick which loaded file to select from:">
                <span v-for="openFile in $store.state.fileTabs" :key="'member-list-item' + openFile.fileName">
                    <b-form-radio v-model="selectedFileName" name="OBOAS-radios" :value="openFile.fileName"> {{ openFile.fileName }}</b-form-radio>
                </span>
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
        <div class="file-elements-list">
            <li v-for="(definition, index) in filteredList" class="element-in-list" @click="memberToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
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
            <b-button variant="primary" @click="submitAddMember" :disabled="selectedIndex == null">
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
            selectedFileName: null,
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
            let inheritanceObjPropObj = null

            if (miscUtilities.hasInheritance(this.$store.state.currentFile.file[definitionName])) {
                console.log('addmember1')

                if (miscUtilities.isTaxonomyElement(this.$store.state.currentFile.file, definitionName)) {
                    inheritanceObjPropObj = miscUtilities.getPropertiesObj(this.$store.state.currentFile.file[definitionName], "TaxonomyElement")
                    this.memberType = inheritanceObjPropObj.type
                    this.memberDescrip = inheritanceObjPropObj.description
                } else {
                    inheritanceObjPropObj = miscUtilities.getPropertiesObj(this.$store.state.currentFile.file[definitionName], "ObjWithInherit")
                    this.memberType = inheritanceObjPropObj.type
                    this.memberDescrip = inheritanceObjPropObj.description
                }
            } else {
                this.memberType = this.$store.state.currentFile.file[definitionName]["type"]
                this.memberDescrip = this.$store.state.currentFile.file[definitionName]["description"]
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
            if (miscUtilities.checkInfiniteLoopErr(this.$store.state.currentFile.file, this.$store.state.isSelected, this.memberName)) {
                this.showErrorInfinite = true
            } 

            if (miscUtilities.checkSuperClassObjConflict(this.$store.state.currentFile.file, this.$store.state.isSelected, this.memberName)) {
                this.showErrorConflict = true
            }

            if (!this.showErrorInfinite && !this.showErrorConflict) {
                this.$store.commit({
                    type: 'addNodeToObject',
                    defnName: this.$store.state.isSelected,
                    memberName: this.memberName,
                    memberType: this.memberType,
                    elemList: this.selectedFileName
                })
                this.hasSubmitted = true
            }
        },
    },
    computed: {
        filteredList() {
            let selectedFileObj = ''
            if (this.selectedFileName) {
                // console.log('selected file name: ')
                // console.log(this.selectedFileName)

                for (let i in this.$store.state.fileTabs) {
                    if (this.$store.state.fileTabs[i].fileName == this.selectedFileName) {
                        selectedFileObj = this.$store.state.fileTabs[i].file
                    }
                }
                // console.log('selectedFileObj: ')
                // console.log(selectedFileObj)
                let allNodesFlat = miscUtilities.getAllElementsFlat(selectedFileObj)
                // console.log('allNodesFlat: ')
                // console.log(allNodesFlat)

                return allNodesFlat.filter( node => {
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
        selectedFileName() {
            console.log(this.selectedFile)
            this.selectedIndex = null;
            this.searchTerm = ''
        }
    }
}
</script>

<style>
.file-elements-list {
    height: 250px;
    overflow-y: auto;
    background-color: white;
    border-top: 1px solid black;
    border-left: 1px solid black;
    border-right: 1px solid black;
    margin-bottom: 4px;

}

.element-in-list {
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
