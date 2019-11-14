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
        <!-- <p> Selected file: <strong>OAS-references.json</strong></p> -->
    </div>
    <div class="element-selector-body" ref="treeContainer">
        <div v-if="file" class="tabs-selector">
            <b-card no-body>
                <b-tabs card>
                <b-tab title="All" active>
                    <b-card-text>
                        <span
                        v-if="$store.state.schemaFile"
                        v-for="(item,name, index) in $store.state.schemaFile"
                        :key="index"
                        >
                        <UploadOBTree
                            v-if="item.type == 'object'"
                            :name="name"
                            :children="item.properties"
                            :depth="0"
                            :expandAllObjects="expandAllObjects"
                            :nodeDescription="item.description"
                            :nodeType="item.type"
                            parent="root"
                            type="object"
                        ></UploadOBTree> 
                        <UploadOBTree
                            v-else
                            :name="name"
                            :depth="0"
                            :expandAllObjects="expandAllObjects"
                            :nodeDescription="item.description"
                            :nodeType="item.type"
                            :ref="name"
                            parent="root"
                            type="element"
                        >
                        </UploadOBTree>
                        </span>


                    </b-card-text>
                </b-tab>
                <b-tab title="Objects">
                    <b-card-text>
                        <span
                        v-if="$store.state.schemaFile"
                        v-for="(item,name, index) in $store.state.schemaFile"
                        :key="index"
                        >
                            <UploadOBTree
                                v-if="item.properties"
                                :name="name"
                                :children="item.properties"
                                :depth="0"
                                :expandAllObjects="expandAllObjects"
                                :nodeDescription="item.description"
                                :nodeType="item.type"
                                parent="root"
                                type="object"
                            ></UploadOBTree> 
                        </span>
                    </b-card-text>
                </b-tab>
                <b-tab title="Elements">
                    <b-card-text>
                        <span
                        v-if="$store.state.schemaFile"
                        v-for="(item,name, index) in $store.state.schemaFile"
                        :key="index"
                        >
                            <UploadOBTree
                                v-if="item.properties === undefined"
                                :name="name"
                                :depth="0"
                                :expandAllObjects="expandAllObjects"
                                :nodeDescription="item.description"
                                :nodeType="item.type"
                                parent="root"
                                type="element"
                            ></UploadOBTree> 
                        </span>
                    </b-card-text>
                </b-tab>
                </b-tabs>
            </b-card>
        </div>
        <div v-else>
            <p> Please select an Open API file from your system.</p>
        </div>

    </div>
    <div class="element-selector-footer">
        <!-- <b-button variant="outline-secondary" size="sm">Select All</b-button> 
        <b-button variant="outline-secondary" size="sm">Select None</b-button>
        <b-button variant="outline-secondary" size="sm">Expand All</b-button>
        <b-button variant="outline-secondary" size="sm">Collapse All</b-button>       -->
        <b-button variant="primary" size="sm" @click="showCreateDefinitionForm">Create New Definition</b-button>
        <!-- <b-button variant="outline-secondary" size="sm" @click="showCreateElementForm">Create New Element</b-button>
        <b-button variant="outline-secondary" size="sm" @click="showCreateObjectForm">Create New Object</b-button> -->
    </div>


    
    <div class="element-editor-header">
        <div class="editor-header">
            <h4 v-show="$store.state.showDetailedView">Detailed View</h4>
            <h4 v-show="$store.state.showEditNodeView">Edit </h4>
            <!-- <h4 v-show="$store.state.showCreateNodeElementView">Create Element</h4>
            <h4 v-show="$store.state.showCreateNodeObjectView">Create Object</h4> -->
            <h4 v-show="$store.state.showCreateDefinitionForm">Create Definition</h4>
        </div>
        <div class="download-button-container">
            <b-button variant="primary" @click="exportFile">Export</b-button>
        </div>
    </div>
    <div class="element-editor-body">
        <DetailedNodeView v-show="$store.state.showDetailedView"/>
        <EditNodeForm v-show="$store.state.showEditNodeView" />
        <CreateNodeElementForm v-show="$store.state.showCreateNodeElementView" />
        <CreateNodeObjectForm v-show="$store.state.showCreateNodeObjectView" />
        <CreateDefinitionForm v-show="$store.state.showCreateDefinitionForm" />
    </div>
    <div class="element-editor-footer">
        <!-- <b-button variant="outline-secondary" size="sm" id="create-new-elem-btn">Create New Element</b-button>
        <b-button variant="outline-secondary" size="sm">Create New Object</b-button> -->
        <!-- <b-button variant="outline-secondary" size="sm" @click="toggleDetailedView">Toggle Detailed View</b-button> -->
        <!-- <b-button variant="outline-secondary" size="sm" @click="toggleEditorView">Toggle Editor View</b-button> -->
    </div>

  </div>
</template>


<script>
import UploadOBTree from "../components/UploadOBTree.vue"
import DetailedNodeView from "../components/DetailedNodeView.vue"
// import JSONFile from "../assets/OB-OAS-Master-Definition.json"
import JSONFile from "../assets/OAS-references.json"
import EditNodeForm from "../components/forms/EditNodeForm.vue"
import CreateNodeElementForm from "../components/forms/CreateNodeElementForm.vue"
import CreateNodeObjectForm from "../components/forms/CreateNodeObjectForm.vue"
import CreateDefinitionForm from "../components/forms/CreateDefinitionForm.vue"



export default {
    components: { UploadOBTree, DetailedNodeView, EditNodeForm, CreateNodeElementForm, CreateNodeObjectForm, CreateDefinitionForm },
    // created() {
    //     this.$store.commit("updateOriginalJSONFile", JSONFile)
    // },
  data() {
    return {
      file: null,
        expandAllObjects: null,
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
      showCreateElementForm() {
          this.$store.commit("selectNone")
          this.$store.commit("showCreateNodeElementView")
      },
      showCreateObjectForm() {
            this.$store.commit("selectNone")
          this.$store.commit("showCreateNodeObjectView")
      },
      exportFile() {
          this.$store.commit("exportFile")
      },
      showCreateDefinitionForm() {
            this.$store.commit("selectNone")

          this.$store.commit("showCreateDefinitionForm")
      }
  },
  watch: {
      file() {
          this.fileToJSON();
      },
      // jump to definition node if you want to edit the non-definition node
      "$store.state.selectDefinitionNode"() {
          if (this.$store.state.selectDefinitionNode == true && this.$store.state.nodeType != "object") {
              let yCoord = this.$refs[this.$store.state.isSelected][0].$el.offsetTop
              this.$refs.treeContainer.scrollTop = yCoord - 200
              this.$store.commit("toggleSelectDefinitionNode")
          }
      }
  },
  computed: {

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
    grid-column: 1 / 2;
    padding-top: 5px;

}

.download-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    grid-column: 2 / 3;
    padding-bottom: 4px;
    padding-top: 4px;
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

.card { min-height: 100%}

.card-body {
    padding: 0px !important;
    padding-top: 5px !important;
}
</style>

