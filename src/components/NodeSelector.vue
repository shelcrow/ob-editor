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
</div>
</template>

<script>
export default {
    data() {
        return {
            searchTerm: '',
            selectedIndex: '',

        }
    },
    methods: {
        nodeToAdd(index, definitionName) {
            this.selectedIndex = index;
            this.$store.commit("setAddNodeToObject", definitionName)
        }
    },
    computed: {
        filteredList() {
            return this.$store.state.allNodesFlat.filter( node => {
                return node.toLowerCase().includes(this.searchTerm.toLowerCase())
            })
        }
    }
}
</script>

<style>
.node-list {
    height: 300px;
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
