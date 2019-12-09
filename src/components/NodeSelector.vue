<template>
    <div class="node-selector-container">
        <b-form-group 
            id="node-selector-input-label"
            label="Choose definition to add to object:"
            label-for="node-selector-input"
        >
            <b-form-input v-model="searchTerm" placeholder="Search for definition..."></b-form-input>
        </b-form-group>
        <div class="node-list">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="nodeToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
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
        nodeToAdd(index, definitionName) {
            let elemType = ''
            let elemDescrip = ''

            this.selectedIndex = index;

            this.$store.commit("setAddNodeToObject", definitionName)

            Object.keys(this.$store.state.schemaFile).forEach(key => {
                if (key == definitionName) {
                    elemType = this.$store.state.schemaFile[key]["type"]
                    elemDescrip = this.$store.state.schemaFile[key]["description"]
                }
            })
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
            return this.$store.state.allNodesFlat.filter( node => {
                // won't show object or element that is being added to in list of possible objects or elements that can be added
                if ( node.toLowerCase() != this.$store.state.isSelected.toLowerCase() ) {
                    return node.toLowerCase().includes(this.searchTerm.toLowerCase())

                }
            })
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
