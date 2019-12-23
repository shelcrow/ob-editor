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
        <div class="solar-taxonomy-node-list" v-if="selectedElemLst == 'solar-taxonomy'">
            <li v-for="(definition, index) in filteredList" class="node-in-list" @click="nodeToAdd(index, definition)" :class="{'selected-node': index == selectedIndex}">
                {{ definition }}
            </li>
        </div>
        <div class="OBOAS-node-list" v-if="selectedElemLst == 'OBOAS'">
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
            selectedElementDetails: null,
            selectedElemLst: "OBOAS"
        }
    },
    methods: {
        nodeToAdd(index, definitionName) {
            let elemType = ''
            let elemDescrip = ''

            this.selectedIndex = index;

            this.$store.commit({
                type:"setAddNodeToObject", 
                definitionName: definitionName,
                nodeListType: this.selectedElemLst
            })

            if (this.selectedElemLst == "OBOAS") {
                elemType = this.$store.state.schemaFile[definitionName]["type"]
                elemDescrip = this.$store.state.schemaFile[definitionName]["description"]
            } else if (this.selectedElemLst == "solar-taxonomy") {
                elemType = this.$store.state.xbrlFile[definitionName]["type"]
                elemDescrip = this.$store.state.xbrlFile[definitionName]["description"]
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
        }
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

.source-checkboxes {
    margin-bottom: 15px;
}


</style>
