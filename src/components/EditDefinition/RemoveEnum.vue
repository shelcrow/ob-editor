<!-- 
Component for removing enumeration from definitions
-->

<template>
    <div class="remove-enum-container">
        <p>Enumerations: </p>
        <div class="enum-list">
            <li v-for="(_enum, index) in sortedEnumList" @click="enumSelect(_enum, index)" class="enum-in-enum-list" :class="{'selected-node': index == selectedIndex}">
                {{ _enum }}
            </li>            
        </div>
        <div class="remove-button-container">
            <b-button variant="danger" @click="removeEnum">
                Remove
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedIndex: null,
            selectedEnum: ''
        }
    },
    methods: {
        enumSelect(_enum, index) {
            this.selectedIndex = index
            this.selectedEnum = _enum
        },
        removeEnum() {
            this.$store.commit("removeEnumFromObject", this.selectedEnum)
            this.selectedIndex = null
        }
    },
    computed: {
        sortedEnumList() {
            if (this.$store.state.nodeEnum == "None") {
                return []
            } else {
                return this.$store.state.nodeEnum
            }
        }
    }
}
</script>

<style>
.enum-in-enum-list {
    list-style: none;
    border-bottom: 1px solid black;
}

.enum-list {
    height: 250px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid black;
    margin-bottom: 4px;
}

.selected-node {
    background-color: #89CFF0;
}

.remove-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

