<!-- 
Component for adding members to objects
-->

<template>
    <div id="add-member-edit-view-container">
        <div id="add-member-select-docs-container">
            <div>Select document:</div>
            <b-form-select v-model="selectedFileName" :options="getLoadedFiles" :select-size="4" id="select-form-files"></b-form-select>
            <br />
            <b-form-group 
                id="node-selector-input-label"
                label="Choose definition to add to object:"
                label-for="node-selector-input"
            >
                <b-form-input v-model="searchTerm" placeholder="Search for definition..."></b-form-input>
            </b-form-group>
            <div>Select definition to add:</div>
            <div class="file-elements-list">
                <span v-if="selectedFileName">
                    <li v-for="(name, index) in fileElements" id="defn-from-file" @click="selectDefn(index, name)" :class="{'selected-node': index == selectedDefnIndex}"> {{ name }}</li>
                </span>
            </div>
            <b-table
                :items="defnDetails"
                id="add-member-detail-table"
                ref="add-member-detail-table"
                v-if="selectedDefnName"
            ></b-table>
        </div>
        <div class="error-container">
            <span v-if="showErrorInfinite || showErrorConflict">
                <p id="error-msg" v-if="showErrorInfinite">Can't add this, will cause infinite loop error. Object or superclass contains the one you're trying to add</p>
                <p id="error-msg" v-if="showErrorConflict">Can't add this, will cause conflict error. Object or superclass is being referenced already</p>
            </span>
        </div>
        <div id="add-member-footer">
            <span id="add-member-view-btns">
                <b-button variant="primary" size="sm" @click="submitAddMember" :disabled="selectedDefnIndex == null">
                    <span v-if="!hasSubmitted">Add</span>
                    <span v-else>Add another</span>
                </b-button>
                <b-button @click="goPreviousView" size="sm">Back</b-button>
            </span>
        </div>
    </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities"

export default {
    data() {
        return {
            searchTerm: '',
            selectedElementDetails: null,
            selectedFileName: null,
            definitionToAdd: '',
            memberType: '',
            memberDescrip: '',
            memberName: '',
            hasSubmitted: false,
            showErrorInfinite: false,
            showErrorConflict: false,

            selectedDefnIndex: null,
            selectedDefnName: null,
            selectedDefnType: null,
            selectedDefnDescrip: null
        }
    },
    methods: {
        selectDefn(index, definitionName) {
            this.selectedDefnIndex = index;
            this.selectedDefnName = definitionName
            this.showErrorInfinite = false
            this.showErrorConflict = false
            // let inheritanceObjPropObj = null

            // console.log('in add member')
            // console.log('defn name: ')
            // console.log(definitionName)
            // console.log('file name')
            // console.log(this.selectedFileName)
            // console.log('loaded files')
            // console.log(this.$store.state.loadedFiles)

            // console.log(this.$store.state.loadedFiles[this.selectedFileName])

            // if (miscUtilities.hasInheritance(this.$store.state.loadedFiles[this.selectedFileName]["file"][definitionName])) {
            //     console.log('addmember1')

            //     if (miscUtilities.isTaxonomyElement(this.$store.state.loadedFiles[this.selectedFileName]["file"], definitionName)) {
            //         inheritanceObjPropObj = miscUtilities.getPropertiesObj(this.$store.state.loadedFiles[this.selectedFileName]["file"][definitionName], "TaxonomyElement")
            //         this.selectedDefnType = inheritanceObjPropObj.type
            //         this.selectedDefnDescrip = inheritanceObjPropObj.description
            //     } else {
            //         inheritanceObjPropObj = miscUtilities.getPropertiesObj(this.$store.state.loadedFiles[this.selectedFileName]["file"][definitionName], "ObjWithInherit")
            //         this.selectedDefnType = inheritanceObjPropObj.type
            //         this.selectedDefnDescrip = inheritanceObjPropObj.description
            //     }
            // } else {
            //     this.selectedDefnType = this.$store.state.loadedFiles[this.selectedFileName]["file"][definitionName]["type"]
            //     this.selectedDefnDescrip = this.$store.state.loadedFiles[this.selectedFileName]["file"][definitionName]["description"]
            // }

            // if (!this.selectedDefnDescrip) {
            //     this.selectedDefnDescrip = "Documentation not available"
            // }

            // let obj = {
            //     "Name": this.selectedDefnName,
            //     "Type": this.selectedDefnType,
            //     "Documentation": this.selectedDefnDescrip
            // }

            // let arr = []
            // arr.push(obj)
            // this.selectedElementDetails = arr
        },
        submitAddMember() {
            // console.log('in add member, checking infite loop err')
            // if (miscUtilities.checkInfiniteLoopErr(this.$store.state.loadedFiles[this.selectedFileName]["file"], this.$store.state.isSelected, this.selectedDefnName)) {
            //     this.showErrorInfinite = true
            // } 

            // console.log('in add member, checking checkSuperClassObjConflict')
            // if (miscUtilities.checkSuperClassObjConflict(this.$store.state.loadedFiles[this.selectedFileName]["file"], this.$store.state.isSelected, this.selectedDefnName)) {
            //     this.showErrorConflict = true
            // }

            // if (!this.showErrorInfinite && !this.showErrorConflict) {
            //     this.$store.commit({
            //         type: 'addNodeToObject',
            //         defnName: this.$store.state.isSelected,
            //         memberName: this.selectedDefnName,
            //         memberType: this.selectedDefnType,
            //         elemList: this.selectedFileName
            //     })
            //     this.hasSubmitted = true
            // }

            if (!this.showErrorInfinite && !this.showErrorConflict) {
                this.$store.commit({
                    type: 'addNodeToObject',
                    parentName: this.$store.state.isSelected,
                    defnToAddName: this.selectedDefnName,
                    referenceFileName: this.selectedFileName
                })
                this.hasSubmitted = true
            }
        },
        goPreviousView() {
            this.$store.state.activeEditingView = 'EditDefinitionFormDisabled'
        },
    },
    computed: {
        fileElements() {
            if (this.selectedFileName) {
                let fileElements = Object.keys(this.$store.state.loadedFiles[this.selectedFileName]["file"])
                // console.log('file elements: ')
                // console.log(fileElements)

                return fileElements.filter( node => {
                    // console.log('node: ')
                    // console.log(node)
                    if ( node.toLowerCase() != this.$store.state.isSelected.toLowerCase() ) {
                        return node.toLowerCase().includes(this.searchTerm.toLowerCase())
                    }   
                }).sort()
            }
        },
        getLoadedFiles() {
            let optionsArr = []
            for (let i in this.$store.state.loadedFiles) {
                optionsArr.push(
                    {
                        "value": i,
                        "text": i
                    }
                )
            }
            // console.log(optionsArr)
            return optionsArr
        },
        defnDetails() {
            // console.log('***** start defnDetails *******')
            let temp_ret_obj = null

            let defnName = this.selectedDefnName
            let defnType = ''
            let defnDescrip = "Documentation not available"
            let defnEnum = ''
            let temp_superClassList = []
            let temp_superClassListStr = ''
            let defnObjChildren = ''
            let typeOfDefn = null


            // console.log('defnDetails 1')
            // console.log('defnName')
            // console.log(defnName)
            let defnFile = this.$store.state.loadedFiles[this.selectedFileName]["file"]

            // console.log('defnDescrip')
            // console.log(defnDescrip)

            if (defnFile[defnName]["allOf"]) {
                if (miscUtilities.isTaxonomyElement(defnFile, defnName)) {
                    typeOfDefn = 'TaxonomyElement'
                } else {
                    typeOfDefn = 'ObjWithInherit'
                }
                for (let i in defnFile[defnName]["allOf"]) {
                    if (defnFile[defnName]["allOf"][i]["$ref"]) {
                        temp_superClassList.push(defnFile[defnName]["allOf"][i]["$ref"]
                            .slice(defnFile[defnName]["allOf"][i]["$ref"].lastIndexOf("/") + 1))
                    } else {
                        if (defnFile[defnName]["allOf"][i]["description"]) {
                            defnDescrip = defnFile[defnName]["allOf"][i]["description"]
                        }
                        if (defnFile[defnName]["allOf"][i]["type"]) {
                            defnType = defnFile[defnName]["allOf"][i]["type"]
                        }
                        if (defnFile[defnName]["allOf"][i]["enum"]) {
                            defnEnum = defnFile[defnName]["allOf"][i]["enum"]
                        }

                        if (typeOfDefn == 'ObjWithInherit') {
                            if (defnFile[defnName]["allOf"][i]["properties"]) {
                                defnObjChildren = Object.keys(defnFile[defnName]["properties"])
                            }
                        }
                    }
                }
            } else if (defnFile[defnName]["properties"]) {
                typeOfDefn = 'Obj'
                if (defnFile[defnName]["type"]) {
                    defnType = defnFile[defnName]["type"]
                }

                if (defnFile[defnName]["properties"]["description"]) {
                    defnDescrip = defnFile[defnName]["properties"]["description"]
                }

                defnObjChildren = Object.keys(defnFile[defnName]["properties"])
            } else {
                typeOfDefn = 'Elem'
                if (defnFile[defnName]["description"]) {
                    defnDescrip = defnFile[defnName]["description"]
                }

                if (defnFile[defnName]["type"]) {
                    defnType = defnFile[defnName]["type"]
                }

                if (defnFile[defnName]["enum"]) {
                    defnEnum = defnFile[defnName]["enum"]
                }
            }

            // console.log('defnDetails 2')
            if (temp_superClassList.length == 0) {
                temp_superClassListStr = 'None'
            } else {
                temp_superClassListStr = temp_superClassList.join(", ")
            }

            if (!defnEnum) {
                defnEnum = "None"
            } else {
                defnEnum = defnEnum.join(', ')
            }

            if (defnObjChildren) {
                defnObjChildren = defnObjChildren.join(', ')
            } else {
                defnObjChildren = "None"
            }
            
            // console.log('detailed node view: ' + this.$store.state.nodeEnum)

            // console.log('defnDetails 3')
            if (typeOfDefn == 'ObjWithInherit') {
                temp_ret_obj = [
                    { "Attributes": "Name", "Values": defnName },
                    { "Attributes": "Type", "Values": defnType },
                    { "Attributes": "Documentation", "Values": defnDescrip },
                    { "Attributes": "Superclasses", "Values": temp_superClassListStr },
                    { "Attributes": "Children", "Values": defnObjChildren}
                ]
            } else if (typeOfDefn == 'TaxonomyElement') {
                temp_ret_obj = [
                    { "Attributes": "Name", "Values": defnName },
                    { "Attributes": "Type", "Values": defnType },
                    { "Attributes": "Documentation", "Values": defnDescrip },
                    { "Attributes": "Superclasses", "Values": temp_superClassListStr },
                ]
            } else if (typeOfDefn == 'Obj') {
                temp_ret_obj = [
                    { "Attributes": "Name", "Values": defnName },
                    { "Attributes": "Type", "Values": defnType },
                    { "Attributes": "Documentation", "Values": defnDescrip },
                    { "Attributes": "Children", "Values": defnObjChildren}
                ]                
            } else if (typeOfDefn == 'Elem'){
                temp_ret_obj = [
                    { "Attributes": "Name", "Values": defnName },
                    { "Attributes": "Type", "Values": defnType },
                    { "Attributes": "Enumeration", "Values": defnEnum },
                    { "Attributes": "Documentation", "Values": defnDescrip }
                ]                
            }
            
            let arr = temp_ret_obj
            // arr.push(temp_ret_obj)
            // console.log(arr)
            // console.log('***** end defnDetails *******')

            return arr
        }
    },
    watch: {
        selectedFileName() {
            // console.log(this.selectedFile)
            this.selectedDefnIndex = null
            this.selectedDefnName = null
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

#add-member-edit-view-container {
    display: grid;
    height: 100%;
    grid-template-rows: 1fr 50px;   
}

#add-member-select-docs-container {
    padding-top: 9px;
    overflow-y: auto;
    grid-row: 1 / 2;
    padding-left: 15px;
    padding-right: 15px; 
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

.node-selector-container {
    padding-left: 15px;
    padding-right: 15px;
}


#select-form-files {
}

#add-member-footer {
    grid-row: 2 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: #d3d3d3 solid 1px;
}
</style>
