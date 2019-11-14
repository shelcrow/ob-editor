import Vue from "vue";
import Vuex from "vuex";
import * as JSONEditor from '../utils/JSONEditor.js'
import FileSaver from "file-saver"

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    uploadedOASFileOriginal: null,
    schemaFile: null,
    allNodesFlat: [],
    selectorFile: null,
    isSelected: null,
    nodeName: null,
    nodeType: null,
    nodeDataType: null,
    nodeParent: null,
    nodeDescription: null,
    showEditNodeView: false,
    showDetailedView: true,
    showCreateNodeElementView: false,
    showCreateNodeObjectView: false,
    listOfDefinitionElements: [],
    selectDefinitionNode: false,
    showCreateDefinitionForm: false,
    nodeToAddToObject: '',

  },
  mutations: {
    updateOriginalJSONFile(state, json_str) {
      // uploadedOASFileOriginal is used for exporting
      // schemaFile is used for referencing the schema object in uploadedOASFileOriginal
      // schemaFile is used for referencing the definition object in schema in uploadedOASFileOriginal

      state.uploadedOASFileOriginal = JSON.parse(json_str)
      state.schemaFile = state.uploadedOASFileOriginal.components.schemas

      Object.keys(state.schemaFile).forEach( key => {
        state.allNodesFlat.push(key)
      }) 
      // replace all instances of schemaFile with schemaFile. schemaFile is no longer needed as we took out the definition obj.
      // state.schemaFile = state.schemaFile
      JSONEditor.createArrayOfAllElementDefinitions(state.schemaFile, state.listOfDefinitionElements)
    },
    selectNode(state, payload) {
      state.isSelected = payload.nodeName;
      state.nodeName = payload.nodeName;
      state.nodeParent = payload.nodeParent
      state.nodeType = payload.nodeType;
      state.nodeDataType = payload.nodeType
      state.nodeDescription = ''
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
      state.showCreateNodeElementView = false
      state.showDetailedView = false
      state.showCreateNodeObjectView = false
      state.showEditNodeView = true
      state.selectDefinitionNode = true


    },
    showDetailedView(state) {
      state.showCreateNodeElementView = false
      state.showEditNodeView = false
      state.showCreateNodeObjectView = false
      state.showDetailedView = true
      state.showCreateDefinitionForm = false
    },
    showCreateNodeElementView(state) {
      state.showEditNodeView = false
      state.showDetailedView = false
      state.showCreateNodeObjectView = false
      state.showCreateNodeElementView = true
    },
    showCreateNodeObjectView(state) {
      state.showEditNodeView = false
      state.showDetailedView = false
      state.showCreateNodeElementView = false
      state.showCreateNodeObjectView = true
    },
    showCreateDefinitionForm(state) {
      state.showCreateDefinitionForm = true
      state.showDetailedView = false
      state.showCreateNodeElementView = false
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
    exportFile(state) {
      let jsonFileToExport = new Blob([JSON.stringify(state.uploadedOASFileOriginal, null, 4)], { type: "application/json" })
      FileSaver.saveAs(jsonFileToExport, "definition_file")
    },
    selectNone(state) {
      state.isSelected = null
      state.nodeName = null
      state.nodeType = null
      state.nodeDataType = null
      state.nodeDescription = null
    },
    createNodeObject(state, payload) {
      JSONEditor.createNodeObject(state.schemaFile, payload.objectName, payload.objectDescription, payload.elementForms)
    },
    toggleSelectDefinitionNode(state) {
      state.selectDefinitionNode = false
    },
    createDefinition(state, payload) {
      let defn_attr = {
        "type": payload.definitionType,
        "description": payload.definitionDescription,
      }
      Vue.set(state.schemaFile, payload.definitionName, defn_attr)
    },
    setAddNodeToObject(state, nodeName) {
      state.nodeToAddToObject = nodeName
    },
    addNodeToObject(state, payload) {
      let nodeType = ''
      Object.keys(state.schemaFile).forEach(key => {
        if (key == state.nodeToAddToObject) {
          nodeType = state.schemaFile[key].type
        }
      })

      JSONEditor.addChildToObject(state.schemaFile, state.nodeName, state.nodeToAddToObject, nodeType)
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
