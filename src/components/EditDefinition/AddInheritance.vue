<!-- 
Component for adding inheritance to objects
-->

<template>
    <div class="node-selector-container">
        <b-form-group 
            id="node-selector-input-label"
            label="Choose superclass to subclass this object from"
            label-for="node-selector-input"
        >
            <b-form-input v-model="searchTerm" placeholder="Search for superclass..."></b-form-input>
        </b-form-group>
        <p>Superclasses:</p>
        <div class="node-list">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="selectSuperClassToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
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
        <br/>
        <div class="error-container">
            <span v-if="showErrorInfinite || showErrorConflict">
                <p id="error-msg" v-if="showErrorInfinite">Can't add this, will cause infinite loop error. Object or superclass contains the one you're trying to add</p>
                <p id="error-msg" v-if="showErrorConflict">Can't add this, will cause conflict error. Object or superclass is being referenced already</p>
            </span>
        </div>
        <div class="submit-button-container">
            <b-button variant="primary" @click="submitAddSuperClass">
                <span v-if="!hasSubmitted">Add</span>
                <span v-else>Add another</span>            
            </b-button>
        </div>
    </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities"

export default {
    created() {
        this.$store.commit("updateFlatObjNodes")
    },
    data() {
        return {
            searchTerm: '',
            selectedIndex: null,
            selectedElementDetails: null,
            superClassName: '',
            showErrorInfinite: false,
            showErrorConflict: false,
            hasSubmitted: true
        }
    },
    methods: {
        selectSuperClassToAdd(index, definitionName) {
            this.selectedIndex = index;
            this.superClassName = definitionName
            this.showErrorInfinite = false
            this.showErrorConflict = false

            let elemType = ''
            let elemDescrip = ''

            if (this.$store.state.schemaFile[definitionName]["allOf"]) {
                elemType = 'object'
            } else {
                elemType = this.$store.state.schemaFile[definitionName]["type"]
                elemDescrip = this.$store.state.schemaFile[definitionName]["description"]
            }

            if (!elemDescrip) {
                elemDescrip = "Documentation not available"
            }

            let obj = {
            "Name": definitionName,
            "Type": elemType,
            "Documentation": elemDescrip
            }

            let arr = []
            arr.push(obj)
            this.selectedElementDetails = arr
        },
        submitAddSuperClass() {
            // check if it causes an infinite heritance loop
            //this works
            // if (miscUtilities.checkInfiniteLoopErr(this.$store.state.schemaFile, this.$store.state.isSelected, this.superClassName)) {
            //     this.showError = true
            // } else {
            //     this.$store.commit("addSuperClass", this.superClassName)
            // }
            // this.$store.commit("addSuperClass", this.superClassName)
            // console.log(miscUtilities.getAllObjInDefn(this.$store.state.schemaFile, this.$store.state.isSelected))
            // console.log(miscUtilities.getAllSuperClassesInDefn(this.$store.state.schemaFile, this.$store.state.isSelected))
            if (miscUtilities.checkInfiniteLoopErr(this.$store.state.schemaFile, this.$store.state.isSelected, this.superClassName)) {
                this.showErrorInfinite = true
            } 

            if (miscUtilities.checkSuperClassObjConflict(this.$store.state.schemaFile, this.$store.state.isSelected, this.superClassName)) {
                this.showErrorConflict = true
            }

            if (!this.showErrorInfinite && !this.showErrorConflict) {
                this.$store.commit("addSuperClass", this.superClassName)
                this.hasSubmitted = true
            }
        }
    },
    computed: {
        filteredList() {
            if (this.$store.state.isSelected) {
                return this.$store.state.allObjNodesFlat.filter( node => {
                    if ( node.toLowerCase() != this.$store.state.isSelected.toLowerCase() ) {
                        return node.toLowerCase().includes(this.searchTerm.toLowerCase())
                    }
                }).sort()
            }
        }
    }
}
</script>

<style>
.node-list {
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
