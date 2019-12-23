import Vue from "vue";
import Vuex from "vuex";
import * as JSONEditor from '../utils/JSONEditor.js'
import FileSaver from "file-saver"
import XBRLFile from "../assets/xbrl_all_elements.json"

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    uploadedOASFileOriginal: null,
    schemaFile: null,
    allNodesFlat: [],
    allObjNodesFlat: [],
    selectorFile: null,
    isSelected: null,
    nodeName: null,
    nodeType: null,
    nodeDataType: null,
    nodeParent: null,
    nodeDescription: null,
    nameRef: null,
    showEditNodeView: false,
    showDetailedView: true,
    listOfDefinitionElements: [],
    selectDefinitionNode: false,
    showCreateDefinitionForm: false,
    nodeToAddToObject: '',
    nodeToAddListType: '',
    superClassToAddToObject: '',
    refreshCreateDefn: false,

    // tracks whether exportModal has been opened, needed so a watcher can reset the export form.
    exportModalOpened: false,
    xbrlFile: XBRLFile,
    xbrlFlat: [],

    //tracks whether you are in the OAS tab or the XBRL tab
    inOASTab: true,
    inXBRLTab: false,

    treeSearchTerm: '',

  },
  mutations: {
    updateOriginalJSONFile(state, json_str) {
      // uploadedOASFileOriginal is used for exporting
      // schemaFile is used for referencing the schema object in uploadedOASFileOriginal
      // schemaFile is used for referencing the definition object in schema in uploadedOASFileOriginal

      state.uploadedOASFileOriginal = JSON.parse(json_str)
      state.schemaFile = state.uploadedOASFileOriginal.components.schemas

      // replace all instances of schemaFile with schemaFile. schemaFile is no longer needed as we took out the definition obj.
      // state.schemaFile = state.schemaFile
      JSONEditor.createArrayOfAllElementDefinitions(state.schemaFile, state.listOfDefinitionElements)
    },
    // for adding children to defns, whether elem or obj
    updateFlatNodes(state) {
      state.allNodesFlat = []
      Object.keys(state.schemaFile).forEach( key => {
        state.allNodesFlat.push(key)
      }) 
    },
    updateFlatObjNodes(state) {
      state.allObjNodesFlat = []
      Object.keys(state.schemaFile).forEach(key => {
        if (state.schemaFile[key]["type"] == "object") {
          state.allObjNodesFlat.push(key)
        }
      })
    },
    updateFlatXBRLNodes(state) {
      state.xbrlFlat = []
      Object.keys(XBRLFile).forEach(key => {
        state.xbrlFlat.push(key)
      })
    },
    selectNode(state, payload) {
      state.isSelected = payload.nodeName;
      state.nodeName = payload.nodeName;
      state.nodeParent = payload.nodeParent
      state.nodeType = payload.nodeType;
      state.nodeDataType = payload.nodeType
      state.nodeDescription = payload.nodeDescription
      state.nameRef = payload.nameRef

      // don't need loop if referencing top level, can just directly access with key to get value(s)
      if (payload.nodeType == 'element') {
        Object.keys(state.schemaFile).forEach(key => {
          if (key == state.nodeName) {
            state.nodeDataType = state.schemaFile[key]["type"]
            state.nodeDescription = state.schemaFile[key]["description"]
          }
        })
      }

    },
    deleteNode(state,payload) {
      if (state.nodeType == 'element' && state.nodeParent == 'root') {
        JSONEditor.deleteAllNodes(payload.OASFile, state.nodeName)
      } else {
        JSONEditor.deleteNode(payload.OASFile, payload.nodeName, payload.parent )
      }
    },
    toggleSelectNode(state) {
      state.isSelected = false
    },
    showEditNodeView(state) {
      state.showDetailedView = false
      state.showEditNodeView = true
      state.selectDefinitionNode = true
    },
    showDetailedView(state) {
      state.showEditNodeView = false
      state.showDetailedView = true
      state.showCreateDefinitionForm = false
    },

    showCreateDefinitionForm(state) {
      state.showCreateDefinitionForm = true
      state.showDetailedView = false
      state.showCreateNodeObjectView = false    
      state.showEditNodeView = false
  
    },
    editNode(state) {
      JSONEditor.editNode(state.schemaFile, state.nodeName, state.nodeDataType, state.nodeDescription)
    },
    createNodeElement(state, payload) {
      // JSONEditor.createNodeElement(state.schemaFile, payload.nodeName, payload.nodeType, payload.nodeElementDescription)
      let node_attr = {
        "type": payload.nodeType,
        "description": payload.nodeElementDescription
      }
      Vue.set(state.schemaFile.definitions.properties, payload.nodeName, node_attr)
    },
    exportFile(state, payload) {
      Vue.set(state.uploadedOASFileOriginal, "info", payload.info )
      let jsonFileToExport = new Blob([JSON.stringify(state.uploadedOASFileOriginal, null, 4)], { type: "application/json" })
      FileSaver.saveAs(jsonFileToExport, payload.filename + ".json")
    },
    selectNone(state) {
      state.isSelected = null
      state.nodeName = null
      state.nodeType = null
      state.nodeDataType = null
      state.nodeDescription = null
      state.nameRef = null
    },
    createNodeObject(state, payload) {
      JSONEditor.createNodeObject(state.schemaFile, payload.objectName, payload.objectDescription, payload.elementForms)
    },
    toggleSelectDefinitionNode(state) {
      state.selectDefinitionNode = false
    },
    createDefinition(state, payload) {
      let defn_attr = {}
      if (payload.definitionType == 'object') {
        defn_attr = {
          "type": payload.definitionType,
          "description": payload.definitionDescription,
          "properties": {}
        }
      } else {
        defn_attr = {
          "type": payload.definitionType,
          "description": payload.definitionDescription,
        }
      }

      Vue.set(state.schemaFile, payload.definitionName, defn_attr)
    },
    setAddNodeToObject(state, payload) {
      state.nodeToAddToObject = payload.definitionName
      state.nodeToAddListType = payload.nodeListType
    },
    setAddNodeToObjectToNone(state) {
      state.nodeToAddToObject = ''
    },
    addNodeToObject(state, payload) {
      let nodeType = ""
      let childObj = {}

      // console.log(state.nodeToAddListType)
      // console.log('nodeToAddToObject: ' + state.nodeToAddToObject) 
      if (state.nodeToAddListType == "OBOAS") {
        // console.log("in oboas")
        childObj["$ref"] = "#/components/schemas/" + state.nodeToAddToObject
        nodeType = state.schemaFile[state.nodeToAddToObject].type
      } else if (state.nodeToAddListType == "solar-taxonomy") {
        // console.log("in solar tax")
        // console.log(state.xbrlFile[state.nodeToAddToObject])
        childObj["$ref"] = "xbrl_all_elements.json#/" + state.nodeToAddToObject
        nodeType = state.xbrlFile[state.nodeToAddToObject]["type"]
        // console.log(nodeType)

        // don't copy definition, just reference it
        // if (!state.schemaFile[state.nodeToAddToObject]) {
        //   Vue.set(state.schemaFile, state.nodeToAddToObject, state.xbrlFile[state.nodeToAddToObject])
        // }
      }
      // console.log('ParentNode: ' + state.nodeParent)
      // console.log('nodeType: ' + nodeType)
      // console.log('node child is being added to: ' + state.nodeName)


      JSONEditor.addChildToObject(state.schemaFile, state.nodeName, state.nodeToAddToObject, nodeType, childObj)
    },
    setAddSuperClassToObject(state, superClassName) {
      console.log(superClassName)
      state.superClassToAddToObject = superClassName
    },

    // Refreshes form inputs when trying to hit add definition after already adding a defn
    refreshCreateDefnInputs(state, refreshBool) {
      state.refreshCreateDefn = refreshBool
    },
    toggleExportModal(state) {
      state.exportModalOpened = !state.exportModalOpened
    },
    addSuperClassToObject(state) {
      console.log("Superclass to add: " + state.superClassToAddToObject)
      let superClassObj = state.schemaFile[state.superClassToAddToObject]["properties"]
      JSONEditor.addSuperClassToObject(state.schemaFile, state.isSelected, state.superClassToAddToObject, superClassObj)
    }
  },
  // actions: {
  //   deleteNode(context, payload) {
  //     console.log(payload)
  //     context.commit("toggleSelectNode"),
  //     context.commit("deleteSingleNode", payload)
  //   }
  // },
  modules: {}
});
