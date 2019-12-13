<template>
  <div class="ob-editor-container">
    <div class="element-selector-header">
        <b-form-file
            v-model="file"
            :state="Boolean(file)"
            placeholder="Choose your OAS Definition File..."
            drop-placeholder="Drop file here..."
            v-if="!file"
        ></b-form-file>
        <span v-else>Selected file: <strong>{{ file ? file.name : '' }}</strong></span>
    </div>
    <div class="element-selector-body" ref="treeContainer">
        <div v-if="file" class="tabs-selector">
            <span
                v-if="$store.state.schemaFile"
                v-for="arr in sortedObjects"
            >

                <!-- 
                    Can check type without fxns because all top level object/elem have types.
                    This first round of recursion only hits top levels
                -->

                <UploadOBTree
                    v-if="arr[1].type == 'object'"
                    :name="arr[0]"
                    :children="arr[1].properties"
                    :depth="0"
                    :expandAllObjects="expandAllObjects"
                    :nodeDescription="arr[1].description"
                    :isObj="true"
                    parent="root"
                    type="object"
                    :ref="arr[0]"
                    :nameRef="objectRef(arr[0])"
                ></UploadOBTree> 
                <UploadOBTree
                    v-else
                    :name="arr[0]"
                    :depth="0"
                    :expandAllObjects="expandAllObjects"
                    :nodeDescription="arr[1].description"
                    :ref="arr[0]"
                    parent="root"
                    type="element"
                    :nameRef="objectRef(arr[0])"
                >
                </UploadOBTree>
            </span>
        </div>
        <div v-else>
            <p> Please select an Open API file from your system.</p>
        </div>

    </div>
    <div class="element-selector-footer">
        <b-button variant="primary" size="sm" @click="toggleExpandAll">
            <span v-if="expandAllObjects">
                Collapse All
            </span>
            <span v-else>
                Expand All
            </span>
        </b-button>
        <b-button variant="primary" size="sm" @click="showCreateDefinitionForm">Create New Definition</b-button>
    </div>


    
    <div class="element-editor-header">
        <div class="editor-header">
            <h4 v-show="$store.state.showDetailedView">Detailed View</h4>
            <h4 v-show="$store.state.showEditNodeView">Edit <strong>{{ $store.state.isSelected}}</strong> </h4>
            <h4 v-show="$store.state.showCreateDefinitionForm">Create Definition</h4>
        </div>
        <div class="download-button-container">
            <b-button variant="primary" v-b-modal.export-modal @click="exportModalOpened">Export</b-button>
        </div>
        </div>
        <div class="element-editor-body">
            <DetailedNodeView v-show="$store.state.showDetailedView"/>
            <EditNodeForm v-show="$store.state.showEditNodeView" />
            <CreateDefinitionForm v-show="$store.state.showCreateDefinitionForm" />
        </div>
        <div class="element-editor-footer">
        </div>

        <!-- Modals -->
        <ExportFormModal />
  </div>
</template>


<script>
import UploadOBTree from "../components/UploadOBTree.vue"
import DetailedNodeView from "../components/DetailedNodeView.vue"
// import JSONFile from "../assets/OB-OAS-Master-Definition.json"
// import JSONFile from "../assets/OAS-references.json"
import EditNodeForm from "../components/forms/EditNodeForm.vue"
import CreateDefinitionForm from "../components/forms/CreateDefinitionForm.vue"
import ExportFormModal from "../components/forms/ExportFormModal"



export default {
    components: { UploadOBTree, DetailedNodeView, EditNodeForm, CreateDefinitionForm, ExportFormModal },
  data() {
    return {
        file: null,
        expandAllObjects: true,
        detailedView: true,
        editorView: false,
        allNodesFlat: []
    };
  },
  methods: {
      fileToJSON() {
          if (this.file) {
              let reader = new FileReader();
              reader.readAsText(this.file);
              reader.onload = () => {
                  this.$store.commit("updateOriginalJSONFile", reader.result)
              }

              reader.onerror = function() {
                  console.log(reader.error)
              }
          }
      },
      exportFile() {
          this.$store.commit("exportFile")
      },
      showCreateDefinitionForm() {
            this.$store.commit("selectNone")

          this.$store.commit("showCreateDefinitionForm")
          this.$store.commit("refreshCreateDefnInputs", true)
      },
      toggleExpandAll() {
          this.expandAllObjects = !this.expandAllObjects
      },
      objectRef(nodeName) {
          return "root-" + nodeName
      },
      exportModalOpened() {
          this.$store.commit("toggleExportModal")
      }
  },
  watch: {
      file() {
          this.fileToJSON();
      },
      // jump to definition node if you want to edit the non-definition node
      // do i need to keep the if statement to differentiate between objects and elements?
      "$store.state.selectDefinitionNode"() {
          if (this.$store.state.selectDefinitionNode == true && this.$store.state.nodeType != "object") {
              this.$store.state.nameRef = "root-" + this.$store.state.nodeName;
              let yCoord = this.$refs[this.$store.state.isSelected][0].$el.offsetTop
              this.$refs.treeContainer.scrollTop = yCoord - 200
              this.$store.commit("toggleSelectDefinitionNode")
          } else if (this.$store.state.selectDefinitionNode == true && this.$store.state.nodeType == "object") {
                this.$store.state.nameRef = "root-" + this.$store.state.nodeName;
              let yCoord = this.$refs[this.$store.state.isSelected][0].$el.offsetTop
              this.$refs.treeContainer.scrollTop = yCoord - 200
              this.$store.commit("toggleSelectDefinitionNode")
          }
          this.$store.state.nodeParent = "root"
      }
  },
  computed: {
      // sort objects into two sections (objects, then elements) and alphabetize
      sortedObjects() {
          let obj_lst = []
          let el_lst = []
          if (this.$store.state.schemaFile) {
            Object.keys(this.$store.state.schemaFile).forEach(key => {
                if (this.$store.state.schemaFile[key]["type"] == "object") {
                    obj_lst.push([key, this.$store.state.schemaFile[key]])
                } else {
                    el_lst.push([key, this.$store.state.schemaFile[key]])
                }
            })
            obj_lst.sort()
            el_lst.sort()
            return obj_lst.concat(el_lst)
          } 
      }
  }

};
</script>


<style>
.ob-editor-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 50px 1fr 50px;
  background-color: #f7f7f7
}

.element-selector-header {
    grid-column: 1 / 2;
    grid-row: 1 /2 ;
    border: #d3d3d3 solid 1px;
    padding-left: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: 15px;
}

.element-selector-body {
    grid-column: 1 / 2;
    grid-row:  2 /3 ;
    border: #d3d3d3 solid 1px;
    overflow-y: auto;
    overflow-x: scroll;

}

.element-selector-footer {
    grid-column: 1 / 2;
    grid-row: 3 /4 ;
    border: #d3d3d3 solid 1px;
    padding-left: 15px;
    display: flex;
    justify-content: center;
    align-items: center;            
}

.element-editor-header {
    grid-column: 2 / 3;
    grid-row: 1 / 2 ;
    border: #d3d3d3 solid 1px;
    padding-left: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr

}

.editor-header {
        display: flex;
    justify-content: left;
    align-items: center;
    grid-column: 1 / span 2;
    grid-row: 1 / 2;
    padding-top: 5px;

}

.download-button-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    padding-bottom: 4px;
    padding-top: 4px;
    padding-right: 15px;
}

.element-editor-body {
    grid-column: 2 / 3;
    grid-row: 2 /3 ;
    border: #d3d3d3 solid 1px;
    padding-left: 15px;
    padding-right: 15px;
    overflow-y: auto;
}

.element-editor-footer {
    grid-column: 2 / 3;
    grid-row: 3 /4 ;
    border: #d3d3d3 solid 1px;
    padding-left: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.btn {
    margin-left: 5px;
}

.tabs-selector {
    min-height: 100%
}

.card { 
    min-height: 100%
}

.card-body {
    padding: 0px !important;
    padding-top: 5px !important;
}

</style>

