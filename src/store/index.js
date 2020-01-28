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
    nodeEnum: null,
    nameRef: null,
    showEditNodeView: false,
    showDetailedView: true,
    listOfDefinitionElements: [],
    selectDefinitionNode: false,
    showCreateDefinitionForm: false,
    nodeToAddToObject: '',
    nodeToAddListType: '',
    superClassToRemoveFromObject: '',
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
    /* 
      Add enumeration to object
    */
    addEnumToObject(state, _enum) {
      JSONEditor.addEnum(state.schemaFile, state.isSelected, _enum)
      state.nodeEnum = state.schemaFile[state.isSelected]["enum"]
    },

    /*
      Remove enumeration from object
    */
    removeEnumFromObject(state, _enum) {
      JSONEditor.removeEnum(state.schemaFile, state.isSelected, _enum)
      if (!state.schemaFile[state.isSelected]["enum"]) {
        state.nodeEnum = null
      }
    },

    /*
      Add member to object
    */
    addNodeToObject(state, payload) {
      let memberObj = {}
      // console.log(payload.memberName)
      if (payload.elemList == "OBOAS") {
        // console.log("in oboas")
        memberObj["$ref"] = "#/components/schemas/" + payload.memberName
      } else if (payload.elemList == "solar-taxonomy") {
        memberObj["$ref"] = "xbrl_all_elements.json#/" + payload.memberName
      }
      // console.log(memberObj)
      // console.log(payload)
      JSONEditor.addChildToObject(state.schemaFile, payload.defnName, payload.memberName, payload.memberType, memberObj)
    },
    
    /*
      Edit definition 
    */
    editNode(state, payload) {
      JSONEditor.editNode(state.schemaFile, payload.nodeName, payload.nodeType, payload.nodeDescription)
      state.nodeName = payload.nodeName
      state.nodeDataType = payload.nodeType
      state.nodeDescription = payload.nodeDescription
    },

    /*
      Add Inheritance
    */
    addSuperClass(state, superClassName) {
      JSONEditor.addSuperClass(state.schemaFile, state.isSelected, superClassName)
    },

    /*
      Remove Inheritance
    */
    removeSuperClass(state, superClassName) {
      JSONEditor.removeSuperClass(state.schemaFile, state.isSelected, superClassName)
    },

    /*
      Tree view handling
    */
    toggleSelectDefinitionNode(state) {
      state.selectDefinitionNode = false
    },
    selectNode(state, payload) {
      state.isSelected = payload.nodeName;
      state.nodeName = payload.nodeName;
      state.nodeParent = payload.nodeParent
      state.nodeType = payload.nodeType;
      state.nodeDataType = payload.nodeType
      state.nodeDescription = payload.nodeDescription
      state.nameRef = payload.nameRef

      if (state.schemaFile[state.isSelected]["enum"]) {
        state.nodeEnum = state.schemaFile[state.isSelected]["enum"]
      } else {
        state.nodeEnum = null
      }

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

    /*
      Editor view handling
    */
    showDetailedView(state) {
      state.showEditNodeView = false
      state.showDetailedView = true
      state.showCreateDefinitionForm = false
    },

    /* 
      JSON file handling
    */
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
        if (state.schemaFile[key]["type"] == "object" || state.schemaFile[key]["allOf"]) {
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


    showCreateDefinitionForm(state) {
      state.showCreateDefinitionForm = true
      state.showDetailedView = false
      state.showCreateNodeObjectView = false    
      state.showEditNodeView = false
  
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
    // Refreshes form inputs when trying to hit add definition after already adding a defn
    refreshCreateDefnInputs(state, refreshBool) {
      state.refreshCreateDefn = refreshBool
    },
    toggleExportModal(state) {
      state.exportModalOpened = !state.exportModalOpened
    },
  }
});
