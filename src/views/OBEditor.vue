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
        <div class="tree-search">
            <b-form-input class="tree-search-bar" v-model="$store.state.treeSearchTerm" placeholder="Search across element names..."></b-form-input>

            <!-- <b-form-group 
                id="tree-search-bar-label"
                label="Search for elements:"
                label-for="tree-search-bar"
            >
                <b-form-input class="tree-search-bar" v-model="searchTerm" placeholder="Search across element names..."></b-form-input>
            </b-form-group> -->
        </div>
        <b-tabs class="file-tabs">
            <b-tab title="Solar Taxonomy" @click="changeTabState('XBRL')">
                <span v-if="$store.state.xbrlFile" v-for="arr in sortedObjectsXBRL">
                    <UploadOBTree
                        :name="arr[0]"
                        :depth="0"
                        :expandAllObjects="expandAllObjects"
                        :nodeDescription="arr[1]['description']"
                        :ref="arr[0]"
                        parent="xbrl"
                        :type="arr[1]['type']"
                        :nameRef="objectRef(arr[0], true)"
                    >
                    </UploadOBTree>
                </span>
                <span class="load-more-btn-container">
                    <b-button variant="primary" @click="loadMore" v-if="showLoadMore">Load more</b-button>
                </span>
            </b-tab>
            <b-tab title="Your OB OAS File" active @click="changeTabState('OAS')">
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
                            :nameRef="objectRef(arr[0], false)"
                        ></UploadOBTree> 
                        <UploadOBTree
                            v-else-if="Array.isArray(arr[1])"
                            :name="arr[0]"
                            :children="subClassChildren(arr[1], arr[2])"
                            :depth="0"
                            :expandAllObjects="expandAllObjects"
                            :nodeDescription="arr[2].description"
                            :isObj="true"
                            parent="root"
                            type="object"
                            :ref="arr[0]"
                            :nameRef="objectRef(arr[0], false)"
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
                            :nameRef="objectRef(arr[0], false)"
                        >
                        </UploadOBTree>
                    </span>
                </div>
                <div v-else>
                    <p> Please select an Open API file from your system.</p>
                </div>                
            </b-tab>
        </b-tabs>


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
        <!-- <div class="element-editor-footer">
        </div> -->

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
            allNodesFlat: [],
            numOfElem: 50,
            showLoadMore: true,
            filteredCount: 0
        };
    },
    created() {
        this.$store.commit("updateFlatXBRLNodes")
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
        objectRef(nodeName, isXBRL) {
            if (isXBRL) {
                return 'xbrl-' + nodeName
            } else {
                return "root-" + nodeName
            }
        },
        exportModalOpened() {
            this.$store.commit("toggleExportModal")
        },
        // returns object containing all children of the superClass and subClass with no duplicates
        subClassChildren(superClassRef, subClassObj) {
            //   console.log("in subclass children")
            let superClassChildren = {}
            let superClassName = ""
            for (let i in superClassRef) {
                superClassName = superClassRef[i].slice(superClassRef[i].lastIndexOf("/") + 1)
                //   console.log("super class name from ref: " + superClassName)
                // need an if statement to check for subclassed objects
                if (this.$store.state.schemaFile[superClassName]["allOf"]) {
                    // let deepSuperClassObj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[superClassName]["allOf"][1]["properties"]))
                    // Object.keys(deepSuperClassObj).forEach( key => {
                    //     console.log("key in deepcopy superclass: " + key)
                    //     deepSuperClassObj[key].fromSuperClass = true
                    // })
                    // console.log(deepSuperClassObj)
                    superClassChildren = {...superClassChildren, ...this.$store.state.schemaFile[superClassName]["allOf"][1]["properties"]}
                } else {
                    let deepSuperClassObj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[superClassName]["properties"]))
                    Object.keys(deepSuperClassObj).forEach( key => {
                        // console.log("key in deepcopy superclass: " + key)
                        deepSuperClassObj[key].fromSuperClass = true
                    })
                    // console.log(deepSuperClassObj)
                    superClassChildren = {...superClassChildren, ...deepSuperClassObj}
                }
            }
            //   console.log({...subClassObj["properties"], ...superClassChildren})
                // console.log({...subClassObj["properties"], ...superClassChildren})
                // console.log(superClassChildren)
            return {...subClassObj["properties"], ...superClassChildren}
        },

      // keep track of what tab you're in to show the right detailed view
        changeTabState(tabName) {
            if (tabName == 'XBRL') {
                this.$store.state.inXBRLTab = true
                this.$store.state.inOASTab = false
            } else {
                this.$store.state.inXBRLTab = false
                this.$store.state.inOASTab = true

            }
        },
            loadMore() {
                this.numOfElem += 50;
                if (this.numOfElem >= this.filteredCount) {
                    this.showLoadMore = false
                }
            }
  },
  watch: {
      file() {
          this.fileToJSON();
      },
      // jump to definition node if you want to edit the non-definition node
      // do i need to keep the if statement to differentiate between objects and elements?
      "$store.state.selectDefinitionNode"() {
          let yCoord = 0
          if (this.$store.state.selectDefinitionNode == true && this.$store.state.nodeType != "object") {
                this.$store.state.nameRef = "root-" + this.$store.state.nodeName;
                // xbrl tab is [0], oboas tab is [1]
                // if element is in both xbrl and oboas, then there will be 2 components in the ref. array
                // we want to use [1] in that case because we only edit on that tab.
                if (this.$refs[this.$store.state.isSelected].length == 2) {
                    yCoord = this.$refs[this.$store.state.isSelected][1].$el.offsetTop
                } else {
                    yCoord = this.$refs[this.$store.state.isSelected][0].$el.offsetTop
                }
                // console.log(yCoord)
                // console.log(this.$refs)
                // console.log(yCoord)
                this.$refs.treeContainer.scrollTop = yCoord - 200
                this.$store.commit("toggleSelectDefinitionNode")
          } else if (this.$store.state.selectDefinitionNode == true && this.$store.state.nodeType == "object") {
                this.$store.state.nameRef = "root-" + this.$store.state.nodeName;
                if (this.$refs[this.$store.state.isSelected].length == 2) {
                    yCoord = this.$refs[this.$store.state.isSelected][1].$el.offsetTop
                } else {
                    yCoord = this.$refs[this.$store.state.isSelected][0].$el.offsetTop
                }
                this.$refs.treeContainer.scrollTop = yCoord - 200
                this.$store.commit("toggleSelectDefinitionNode")
          }
          this.$store.state.nodeParent = "root"
      },

      // watch to see if tab changes, then reset search term
      "$store.state.inXBRLTab"() {
          this.numOfElem = 50
          this.$store.state.treeSearchTerm = ''
          this.$store.state.showDetailedView = false
          this.$store.state.nameRef = ''
          this.$store.state.showEditNodeView = false;
          this.$store.state.showCreateDefinitionForm = false;
      },
      sortedObjectsXBRL() {
        //   console.log("num of elm: " + this.numOfElem)
        //   console.log("filtered count: " + this.filteredCount)
          if (this.numOfElem >= this.filteredCount) {
            //   console.log("set showLoadMOre to False")
              this.showLoadMore = false
          }
      },
      "$store.state.treeSearchTerm"() {
        if (this.numOfElem >= this.filteredCount) {
            // console.log("set showLoadMOre to False")
            this.showLoadMore = false
        } else {
            this.showLoadMore = true
        }
          this.numOfElem = 50
      }
  },
  computed: {
      // sort objects into two sections (objects, then elements) and alphabetize
      sortedObjects() {
          let obj_lst = []
          let el_lst = []
          let superClass_lst = []
          let subClass_obj = {}
          if (this.$store.state.schemaFile) {
            Object.keys(this.$store.state.schemaFile).forEach(key => {
                if (this.$store.state.schemaFile[key]["type"] == "object") {
                    obj_lst.push([key, this.$store.state.schemaFile[key]])
                } else if(this.$store.state.schemaFile[key]["allOf"]) {
                    // console.log("all of")
                    for (let i in this.$store.state.schemaFile[key]["allOf"]) {
                        if (this.$store.state.schemaFile[key]["allOf"][i]["$ref"]) {
                            // console.log("ref found")
                            superClass_lst.push(this.$store.state.schemaFile[key]["allOf"][i]["$ref"])
                        } else {
                            subClass_obj = this.$store.state.schemaFile[key]["allOf"][i]
                            // console.log("no ref found")
                        }
                    }
                    // console.log("Ref list: ")
                    // console.log(superClass_lst)
                    // console.log("subclass obj: ")
                    // console.log(subClass_obj)
                    obj_lst.push([key, superClass_lst, subClass_obj])
                    // el_lst.push([key, this.$store.state.schemaFile[key]])
                } else {
                    el_lst.push([key, this.$store.state.schemaFile[key]])
                }
            })
            // console.log(el_lst)
            obj_lst.sort()
            el_lst.sort()
            return obj_lst.concat(el_lst).filter( node => {
              return node[0].toLowerCase().includes(this.$store.state.treeSearchTerm.toLowerCase())
          })
          } 
      },
        sortedObjectsXBRL() {
                let startArr = []
                let retArr = []
                if (this.$store.state.xbrlFile) {
                    for (let obj in this.$store.state.xbrlFile) {
                        startArr.push([obj, this.$store.state.xbrlFile[obj]])
                        //   console.log(this.$store.state.xbrlFile[obj]["description"])
                    }
                }
                retArr = startArr.sort().filter( node => {
                    return node[0].toLowerCase().includes(this.$store.state.treeSearchTerm.toLowerCase())
                })
                this.filteredCount = retArr.length;
                // console.log(this.filteredCount)
                return retArr.slice(0, this.numOfElem)
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
    display: grid;
    grid-template-rows: 50px 1fr;

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
    grid-row: 2 / span 2 ;
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

.tree-search {
    grid-row: 1 / 2;
    display: flex;
    align-items: center;
    padding-left: 15px;
    width: 559px;
}

.file-tabs {
    grid-row: 2 / 3;
}

.load-more-btn-container {
    margin-top: 5px;
    width: 100%;
    display: flex;
    justify-content: center;
}

</style>

