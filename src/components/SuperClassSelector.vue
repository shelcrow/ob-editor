<template>
    <div class="node-selector-container">
        <b-form-group 
            id="node-selector-input-label"
            label="Choose superclass to subclass this object from"
            label-for="node-selector-input"
        >
            <b-form-input v-model="searchTerm" placeholder="Search for superclass..."></b-form-input>
        </b-form-group>
        <div class="node-list">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="superClassToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
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
    </div>
</template>

<script>
export default {
    data() {
        return {
            searchTerm: '',
            selectedIndex: null,
            selectedElementDetails: null
        }
    },
    methods: {
        superClassToAdd(index, definitionName) {
            this.selectedIndex = index;

            this.$store.commit("setAddSuperClassToObject", definitionName)

            let elemType = this.$store.state.schemaFile[definitionName]["type"]
            let elemDescrip = this.$store.state.schemaFile[definitionName]["description"]

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
    border-top: 1px solid black;
    border-left: 1px solid black;
    border-right: 1px solid black;
    margin-bottom: 4px;

}

.node-in-list {
    list-style: none;
    border-bottom: 1px solid black;
}

.selected-node {
    background-color: #89CFF0;
}


</style>
