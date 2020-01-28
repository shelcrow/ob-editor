<!-- 
Component for removing inheritance from objects
-->

<template>
    <div class="remove-superclass-container">
        <p>Choose superclass to remove from object:</p>
        <div class="superclass-list">
            <li v-for="(superClassName, index) in superClassList" class="superclass-in-list" @click="superClassToRemove(index, superClassName)" :class="{'selected-superclass': index == selectedIndex}">
                {{ superClassName }}
            </li>
        </div>
        <br />
        <div class="superclass-details" v-if="selectedSuperClass">
            <b-table
                v-if="selectedElementDetails"
                stacked
                :items="selectedElementDetails"
                id="selectedElementTable"
                ref="selectedElementTable"
            ></b-table>
        </div>
        <br />
        <div class="submit-button-container">
            <b-button variant="primary" @click="removeSuperClass">
                Remove
            </b-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            searchTerm: '',
            selectedIndex: null,
            selectedSuperClass: '',
            definitionsInSuperClass: []
        }
    },
    methods: {
        superClassToRemove(index, superClassName) {
            this.selectedIndex = index;
            this.selectedSuperClass = superClassName;
            
            let elemType = ''
            let elemDescrip = ''

            if (this.$store.state.schemaFile[superClassName]["allOf"]) {
                elemType = 'object'
            } else {
                elemType = this.$store.state.schemaFile[superClassName]["type"]
                elemDescrip = this.$store.state.schemaFile[superClassName]["description"]
            }

            if (!elemDescrip) {
                elemDescrip = "Documentation not available"
            }

            let obj = {
            "Name": superClassName,
            "Type": elemType,
            "Documentation": elemDescrip
            }

            let arr = []
            arr.push(obj)
            this.selectedElementDetails = arr
        },
        removeSuperClass() {
            this.$store.commit("removeSuperClass", this.selectedSuperClass)
            this.selectedSuperClass = ''
        }
    },
    computed: {
        superClassList() {
            let superClassList = []
            if (this.$store.state.isSelected) {
                for (let i in this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
                    if (this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"]) {
                        superClassList.push(
                            this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"]
                                .slice(this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"]
                                    .lastIndexOf("/") + 1))
                    }
                }
                return superClassList.sort()
            }
        }

    }
}
</script>

<style>
.superclass-list {
    height: 250px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid black;
    margin-bottom: 4px;
}

.superclass-in-list {
    list-style: none;
    border-bottom: 1px solid black;
}

.selected-superclass {
    background-color: #89CFF0;
}

.submit-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
