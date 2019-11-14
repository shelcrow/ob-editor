<template>
    <div class="detailed-view-container">
        <span v-if="nodeDetails">
            <b-table
                stacked
                :items="nodeDetails"
                id="detailsTable"
                ref="nodeDetailTable"
            ></b-table>
            <div class="detailed-view-buttons">
                <b-button variant="primary" size="sm" @click="showEditNodeView">Edit definition</b-button>
                <b-button v-b-modal.modal-delete-node variant="danger" size="sm">Remove</b-button>
            </div>
        </span>
        <b-modal
            id="modal-delete-node"
            title="Delete node"
            ref="delete-modal"
            centered
            no-stacking
            @ok="deleteNode($store.state.isSelected)"
        >
            <span v-html="deleteWarning"></span>
        </b-modal>
    </div>

</template>


<script>
export default {
    data() {
        return {
            nodeDetails: null,
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
    },
    watch: {
        "$store.state.isSelected"() {
            if (this.$store.state.isSelected) {
                let temp_doc = this.$store.state.nodeDescription;
                if (!temp_doc) {
                    temp_doc = "Documentation not available"
                }
                let obj = {
                    "Name": this.$store.state.nodeName,
                    "Type": this.$store.state.nodeDataType,
                    "Documentation": temp_doc
                }
                let arr = []
                arr.push(obj)
                this.nodeDetails = arr
            } else {
                this.nodeDetails = false
            }

        }
    },
    computed: {
        deleteWarning() {
            if (this.$store.state.nodeType == 'element' && this.$store.state.nodeParent == 'root' && this.$store.state.isSelected != null) {
                return "Are you sure you want to delete the definition: " + this.$store.state.isSelected.bold() + "?" + 
                "\nThis is the reference element, deleting this will remove every instance of the element in the file";
            } else if (this.$store.state.isSelected != null){
                return "Are you sure you want to delete " + this.$store.state.isSelected.bold() + "?" + 
                "\nThis will delete the " + this.$store.state.nodeType + ": " + this.$store.state.isSelected.bold() + " in every object: " + this.$store.state.nodeParent.bold()  + ".";
            } else {
                return null
            }

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