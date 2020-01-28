<!-- 
Component for adding enumeration to definitions
-->

<template>
    <div class="add-enum-container">
        <p>Enumerations: </p>
        <div class="enum-list">
            <li v-for="(_enum, index) in sortedEnumList" @click="enumSelect(index)" class="enum-in-enum-list" :class="{'selected-node': index == selectedIndex}">
                {{ _enum }}
            </li>
        </div>
        <div class="add-button-container">
            <input v-model="enumToAdd" />
            <b-button variant="primary" @click="submitAddEnum">
                Add
            </b-button>
            <b-button variant="danger" @click="clearSubmitAddEnumInput">
                Clear
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedIndex: null,
            enumToAdd: '',
        }
    },
    methods: {
        enumSelect(index) {
            this.selectedIndex = index
        },
        submitAddEnum() {
            this.$store.commit("addEnumToObject", this.enumToAdd)
            this.enumToAdd = ''
        },
        clearSubmitAddEnumInput() {
            this.enumToAdd = ''
        }
    },
    computed: {
        sortedEnumList() {
            let tmp_enum_str = []
            if (this.$store.state.nodeEnum == "None") {
                return []
            } else {
                // for (let i in this.$store.state.nodeEnum) {
                //     if (typeof(i) == "string") {
                //         tmp_enum_str.push(this.$store.state.nodeEnum[i])
                //     }
                // }
                // console.log(tmp_enum_str)
                // return tmp_enum_str.join(' ')
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

.add-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>