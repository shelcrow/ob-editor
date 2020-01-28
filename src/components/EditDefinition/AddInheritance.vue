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
            <span v-if="showError">
                <p id="error-msg">Can't select this, will cause infinite loop error</p>
            </span>
        </div>
        <div class="submit-button-container">
            <b-button variant="primary" @click="submitAddSuperClass">
                Add
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
            showError: false
        }
    },
    methods: {
        selectSuperClassToAdd(index, definitionName) {
            this.selectedIndex = index;
            this.superClassName = definitionName
            this.showError = false

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
            if (miscUtilities.checkInfiniteLoopErr(this.$store.state.schemaFile, this.$store.state.isSelected, this.superClassName)) {
                this.showError = true
            } else {
                this.$store.commit("addSuperClass", this.superClassName)
            }
            // this.$store.commit("addSuperClass", this.superClassName)
            // console.log(miscUtilities.getAllObjInDefn(this.$store.state.schemaFile, this.$store.state.isSelected))
            // console.log(miscUtilities.getAllSuperClassesInDefn(this.$store.state.schemaFile, this.$store.state.isSelected))
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
