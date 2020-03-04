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
    isSubClassedNode: false,

    // tracks whether exportModal has been opened, needed so a watcher can reset the export form.
    exportModalOpened: false,
    xbrlFile: XBRLFile,
    xbrlFlat: [],

    //tracks whether you are in the OAS tab or the XBRL tab
    inOASTab: true,
    inXBRLTab: false,

    treeSearchTerm: '',


    //tabs update
    fileTabs: [],
    currentTabIndexFileEditor: null,
    currentFile: null,

    //taxonomy element update
    isTaxonomyElement: false,

  },
  
  mutations: {
    /* 
      Add enumeration to object
    */
    addEnumToObject(state, _enum) {
      JSONEditor.addEnum(state.currentFile.file, state.isSelected, _enum)
      state.nodeEnum = state.currentFile.file[state.isSelected]["enum"]
      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          if (state.currentFile.file[state.isSelected]["allOf"][i]["enum"]) {
            state.nodeEnum = state.currentFile.file[state.isSelected]["allOf"][i]["enum"]
          } 
        }
      }   
    },

    /*
      Remove enumeration from object
    */
    removeEnumFromObject(state, _enum) {
      JSONEditor.removeEnum(state.currentFile.file, state.isSelected, _enum)

      //check if empty enum array to set nodeEnum to null, will not react automatically for some reason
      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          if (!state.currentFile.file[state.isSelected]["allOf"][i]["enum"]) {
            state.nodeEnum = null
          }
        }
      }  
      // if (!state.currentFile.file[state.isSelected]["enum"]) {
      //   state.nodeEnum = null
      // }
    },

    /*
      Add member to object
    */
    addNodeToObject(state, payload) {
      let memberObj = {}
      memberObj["$ref"] = "#/components/schemas/" + payload.memberName
      // console.log(payload.memberName)
      // console.log(memberObj)
      // console.log(payload)
      console.log('addNodeToObject, store: ')
      console.log(payload)
      JSONEditor.addChildToObject(state.currentFile.file, payload.defnName, payload.memberName, payload.memberType, memberObj)
    },
    
    /*
      Edit definition 
    */
    editNode(state, payload) {
      JSONEditor.editNode(state.currentFile.file, payload.nodeName, payload.nodeDescription)
      state.nodeDescription = payload.nodeDescription
    },

    /*
      Add Inheritance
    */
    addSuperClass(state, superClassName) {
      JSONEditor.addSuperClass(state.currentFile.file, state.isSelected, superClassName)
    },

    /*
      Remove Inheritance
    */
    removeSuperClass(state, superClassName) {
      JSONEditor.removeSuperClass(state.currentFile.file, state.isSelected, superClassName)
    },

    /*
      Tree view handling
    */
    toggleSelectDefinitionNode(state) {
      state.selectDefinitionNode = false
    },
    selectNode(state, payload) {
      // console.log('select node')
      // console.log(payload)
      state.isSelected = payload.nodeName;
      state.nodeName = payload.nodeName;
      state.nodeParent = payload.nodeParent
      // state.nodeType = payload.nodeType;
      // all visualized elements / objects are "objects":
      state.nodeType = payload.nodeType
      state.nodeDescription = payload.nodeDescription
      state.nameRef = payload.nameRef
      state.isSubClassedNode = payload.isSubClassedNode
      state.isTaxonomyElement = payload.isTaxonomyElement

      // console.log(payload.isSubClassedNode)
      // console.log('selectNode in store: ')
      // console.log(state.nodeParent)
      if (state.currentFile.file[state.isSelected]["allOf"]) {
        for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
          if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
            if (state.currentFile.file[state.isSelected]["allOf"][i]["enum"]) {
              state.nodeEnum = state.currentFile.file[state.isSelected]["allOf"][i]["enum"]
            } else {
              state.nodeEnum = null
            }
          }
        }   
      }

      // if (state.currentFile.file[state.isSelected]["enum"]) {
      //   state.nodeEnum = state.currentFile.file[state.isSelected]["enum"]
      // } else {
      //   state.nodeEnum = null
      // }

      // don't need loop if referencing top level, can just directly access with key to get value(s)
      // if (payload.nodeType == 'element') {
      //   Object.keys(state.currentFile.file).forEach(key => {
      //     if (key == state.nodeName) {
      //       state.nodeDataType = state.currentFile.file[key]["type"]
      //       state.nodeDescription = state.currentFile.file[key]["description"]
      //     }
      //   })
      // }

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
    deleteNode(state,payload) {
      // console.log('node name: ' + payload.nodeName)
      // console.log('parent name: ' + payload.parent)
      if (state.nodeParent == 'root') {
        console.log(1)
        JSONEditor.deleteAllNodes(payload.currentFile, state.nodeName)
      } else {
        console.log(22)
        JSONEditor.deleteNode(payload.currentFile, payload.nodeName, payload.parent)
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
      // Vue.set(state.currentFile.file, "info", payload.info )
      let jsonFileToExport = new Blob([JSON.stringify(state.currentFile.fullFileForExport, null, 4)], { type: "application/json" })
      FileSaver.saveAs(jsonFileToExport, payload.filename + ".json")
    },
    selectNone(state) {
      state.isSelected = null
      state.nodeName = null
      state.nodeType = null
      state.nodeDescription = null
      state.nameRef = null
    },
    createNodeObject(state, payload) {
      JSONEditor.createNodeObject(state.schemaFile, payload.objectName, payload.objectDescription, payload.elementForms)
    },

    createDefinition(state, payload) {
      let defn_attr = {}
      if (payload.definitionType == 'OB Object') {
        defn_attr = {
          "type": "object",
          "description": payload.definitionDescription,
          "properties": {}
        }
      } else {
        defn_attr = {
          "allOf": [
            {
                "$ref": "#/components/schemas/TaxonomyElement"
            },
            {
                "type": "object",
                "description": payload.definitionDescription
            }
          ]
        }
      }

      Vue.set(state.currentFile.file, payload.definitionName, defn_attr)
    },
    // Refreshes form inputs when trying to hit add definition after already adding a defn
    refreshCreateDefnInputs(state, refreshBool) {
      state.refreshCreateDefn = refreshBool
    },
    toggleExportModal(state) {
      state.exportModalOpened = !state.exportModalOpened
    },
    clearEditorView(state) {
      state.showDetailedView = false
      state.showEditNodeView = false
      state.showCreateDefinitionForm = false
      state.isSelected = null
      state.nameRef = null
    },
    // createNewFile(state, payload) {
    //   let newFileJSON = JSONEditor.createNewDefnFile(payload.newFileTitle, payload.newFileDescription, payload.newFileFileName)
    //   // console.log(newFileJSON)
    // }
  }
});
