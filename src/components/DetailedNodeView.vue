<template>
    <div class="detailed-view-container">
        <span v-if="$store.state.isSelected">
            <b-table
                stacked
                :items="defnDetails"
                id="detailsTable"
                ref="nodeDetailTable"
            ></b-table>
            <div class="detailed-view-buttons">
                <span v-if="$store.state.inOASTab">
                    <b-button v-if="$store.state.nodeParent == 'root'" variant="primary" size="sm" @click="showEditNodeView">Edit definition</b-button>
                    <b-button v-else variant="primary" size="sm" v-b-modal.modal-edit-node>Edit definition</b-button>

                    <b-button v-b-modal.modal-delete-node variant="danger" size="sm">
                        <span v-if="$store.state.nodeParent == 'root'"> Delete </span>
                        <span v-else>Remove </span>
                    </b-button>
                    <!-- <b-button variant="danger" @click="cancelDetailedView" size="sm">Cancel</b-button> -->
                </span>
            </div>
        </span>


        <!-- modals -->
        <!-- <b-modal
            id="modal-edit-direct-definition"
            title="Edit definition"
            ref="edit-definition"
            centered
            no-stacking
            @ok="showEditNodeView"
        >
            <p> You cannot edit nested elements, only top level elements. Click OK to edit the corresponding top level element </p>
        </b-modal> -->
        <b-modal
            id="modal-delete-node"
            :title="deleteWarningTitle"
            ref="delete-modal"
            centered
            no-stacking
            @ok="deleteNode($store.state.isSelected)"
        >
            <span v-html="deleteWarning"></span>
        </b-modal>
        <b-modal
            id="modal-edit-node"
            title="Edit member?"
            ref="edit-modal-warning"
            centered
            no-stacking
            @ok="showEditNodeView()"
        >
            <p>This {{$store.state.nodeType}} is a member and cannot be edited. <br>Would you like to edit the definition?</p>
        </b-modal>
    </div>

</template>


<script>
export default {
    data() {
        return {
            nodeDetails: null,
            defnName: '',
        }
    },
    methods: {
        deleteNode(nodeName) {
            this.$store.commit({
                type: "deleteNode",
                nodeName: nodeName,
                OASFile: this.$store.state.schemaFile,
                parent: this.$store.state.nodeParent,
                nodeType: this.$store.state.nodeType
            })
            // this.$store.dispatch(
            //     "deleteNode",
            //     {
            //     nodeName: nodeName,
            //     OASFile: this.$store.state.schemaFile,
            //     parent: this.$store.state.selectedParent
            // })
            this.$store.commit("selectNone")
        },
        showEditNodeView() {
            this.$store.commit("showEditNodeView")
        },
        cancelDetailedView() {
            this.$store.state.showDetailedView = false;
        }
    },
    watch: {
        // "$store.state.isSelected"() {
            //     this.defnName = this.$store.state.isSelected
            //     console.log(this.defnName)
            // if (this.$store.state.isSelected) {
            //     let temp_doc = this.$store.state.nodeDescription;
            //     let temp_superClassList = []
            //     let temp_superClassListStr = ''
            //     let temp_ret_obj = {}

            //     if (this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
            //         for (let i in this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
            //             if (this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"]) {
            //                 temp_superClassList.push(this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"].slice(this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"].lastIndexOf("/") + 1))
            //             }
            //         }
            //     }

            //     if (temp_superClassList.length == 0) {
            //         temp_superClassListStr = 'None'
            //     } else {
            //         temp_superClassListStr = temp_superClassList.join(", ")
            //     }

            //     if (!temp_doc) {
            //         temp_doc = "Documentation not available"
            //     }

            //     if (this.$store.state.schemaFile[this.$store.state.isSelected]["type"] == "object" || this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
            //         temp_ret_obj = {
            //             "Name": this.$store.state.nodeName,
            //             "Type": this.$store.state.nodeDataType,
            //             "Documentation": temp_doc,
            //             "Superclasses": temp_superClassListStr
            //         }
            //     } else {
            //         temp_ret_obj = {
            //             "Name": this.$store.state.nodeName,
            //             "Type": this.$store.state.nodeDataType,
            //             "Documentation": temp_doc,
            //         }
            //     }



            //     let arr = []
            //     arr.push(temp_ret_obj)
            //     this.nodeDetails = arr
            // } else {
            //     this.nodeDetails = false
            // }

        // }
    },
    computed: {
        deleteWarning() {
            if (this.$store.state.nodeType == 'element' && this.$store.state.nodeParent == 'root' && this.$store.state.isSelected != null) {
                return "Are you sure you want to delete the definition: " + this.$store.state.isSelected.bold() + "?" + 
                "\nThis is the " + "definition".bold() + " element, deleting this will remove every instance of the element in the file";
            } else if (this.$store.state.nodeType == 'object' && this.$store.state.nodeParent == 'root' && this.$store.state.isSelected != null){
                return "Are you sure you want to delete the definition: " + this.$store.state.isSelected.bold() + "?" + 
                "\nThis is the " + "definition".bold() + " object, deleting this will remove every instance of the element in the file";
            } else if (this.$store.state.isSelected != null) {
                return "Are you sure you want to delete " + this.$store.state.isSelected.bold() + "?" + 
                "\nThis will remove the " + "member ".bold() + this.$store.state.nodeType + ": " + this.$store.state.isSelected.bold() + " from the object: " + this.$store.state.nodeParent.bold() + ", but will not delete the definition.";
            }
        },
        deleteWarningTitle() {
            if (this.$store.state.nodeParent == 'root') {
                return "Delete " + this.$store.state.nodeType
            } else {
                return "Remove " + this.$store.state.nodeType;
            }
        },
        defnDetails() {
            let temp_defn_name = this.defnName
            let temp_doc = this.$store.state.nodeDescription;
            let temp_superClassList = []
            let temp_superClassListStr = ''
            let temp_ret_obj = {}
            let temp_enum = this.$store.state.nodeEnum
            if (!temp_doc) {
                temp_doc = "Documentation not available"
            }

            if (!temp_enum) {
                temp_enum = "None"
            } else {
                temp_enum = temp_enum.join(', ')
            }

            if (this.$store.state.inOASTab) {
                if (this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
                    for (let i in this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
                        if (this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"]) {
                            temp_superClassList.push(this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"].slice(this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"][i]["$ref"].lastIndexOf("/") + 1))
                        }
                    }
                }
                
                if (temp_superClassList.length == 0) {
                    temp_superClassListStr = 'None'
                } else {
                    temp_superClassListStr = temp_superClassList.join(", ")
                }
                
                // console.log('detailed node view: ' + this.$store.state.nodeEnum)

                
                if (this.$store.state.schemaFile[this.$store.state.isSelected]["type"] == "object" || this.$store.state.schemaFile[this.$store.state.isSelected]["allOf"]) {
                    temp_ret_obj = {
                        "Name": this.$store.state.nodeName,
                        "Type": this.$store.state.nodeDataType,
                        "Documentation": temp_doc,
                        "Superclasses": temp_superClassListStr
                    }
                } else {
                    temp_ret_obj = {
                        "Name": this.$store.state.nodeName,
                        "Type": this.$store.state.nodeDataType,
                        "Enumeration": temp_enum,
                        "Documentation": temp_doc,
                    }
                }
            } else {
                if (this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"]) {
                    for (let i in this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"]) {
                        if (this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"][i]["$ref"]) {
                            temp_superClassList.push(this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"][i]["$ref"].slice(this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"][i]["$ref"].lastIndexOf("/") + 1))
                        }
                    }
                }

                if (temp_superClassList.length == 0) {
                    temp_superClassListStr = 'None'
                } else {
                    temp_superClassListStr = temp_superClassList.join(", ")
                }

                
                if (this.$store.state.xbrlFile[this.$store.state.isSelected]["type"] == "object" || this.$store.state.xbrlFile[this.$store.state.isSelected]["allOf"]) {
                    temp_ret_obj = {
                        "Name": this.$store.state.nodeName,
                        "Type": this.$store.state.nodeDataType,
                        "Documentation": temp_doc,
                        "Superclasses": temp_superClassListStr
                    }
                } else {
                    temp_ret_obj = {
                        "Name": this.$store.state.nodeName,
                        "Type": this.$store.state.nodeDataType,
                        "Documentation": temp_doc,
                    }
                }
            }
            
            let arr = []
            arr.push(temp_ret_obj)
            // console.log(arr)
            return arr
        }
    }
}


</script>


<style>
#detailsTable {
    background-color: white;
}

.detailed-view-buttons {
    height: 50px;
    background-color: white; 
    margin-top: -16px;
    border-top: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>