<template>
  <div class="ob-tree-container">
    <div
      class="node-wrapper"
      @click="toggleSelect"
      :style=" isSelected ? 'background-color: #89CFF0;' : '' "
    >
      <div class="element-div" :style="indent">
        <span @click="toggleExpandObject">
          <v-icon
            v-if="isObj && expandObject"
            name="minus-square"
            class="icon-expandable clickable"
          />
          <v-icon
            v-if="isObj && !expandObject"
            name="plus-square"
            class="icon-expandable clickable"
            style="cursor: pointer"
          />
        </span>
        <span @click="toggleExpandElement">
          <v-icon
            v-if="isTaxonomyElement && !expandElement"
            name="circle"
            class="taxonomy-element-icon-expandable clickable"
            style="cursor: pointer"
          />
          <v-icon
            v-if="isTaxonomyElement && expandElement"
            name="circle"
            class="taxonomy-element-icon-expandable clickable"
            style="cursor: pointer"
          />
        </span>
        <span :class="{ subClassSignifier: subClassedNode, importedNodeSignifier: importedNode }">
          <!-- <b-form-checkbox
            style="display:inline"
            class="checkbox-s"
            v-model="selected"
            value="name"
            @click="selectTest"
          ></b-form-checkbox>-->
          {{ shortenName }}
          <span class="options" >
            <!-- <label title="Add" @click="showAddChildModal" v-if="children" class="clickable">
              <v-icon name="plus" />
            </label> -->

            <!-- <label title="Edit" @click="showEditNodeModal" class="clickable">
              <v-icon name="edit" />
            </label>

            <label title="Delete" @click="showDeleteNodeModal" class="clickable">
              <v-icon name="trash" />
            </label> -->
          </span>

          <!-- TOOL TIP 
            <b-tooltip :target="toolTipID" triggers="hover" placement="right">
              <span v-if="nodeDescription">
                {{ nodeDescription }}
              </span>
              <span v-else>
                <p> No documentation available </p>
              </span>
            </b-tooltip> -->




        </span>
      </div>
    </div>
    <!-- <span 
      v-for="(item, child_name) in children"
      :key="child_name"
    >  -->
    <span v-if="children">
      <span 
        v-for="arr in sortedObjects"
      > 
        <!-- object -->
        <UploadOBTree
          v-if="expandObject && arr[3] == 'Object'"
          :name="arr[0]"
          :children="arr[1].properties"
          :depth="depth + 1"
          :nodeDescription="arr[1].description"
          :isObj="true"
          :parent=name
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[4]"
          :isLocal="arr[5]"          
      ></UploadOBTree> 

      <!-- taxonomy element -->
      <UploadOBTree
          v-else-if="expandObject && arr[3] == 'TaxonomyElement'"
          :isObj="false"
          :name="arr[0]"
          :children="subClassChildren(file.file, arr[4], arr[1], arr[5])"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :parent=name
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="true"
          :subClassedNode="arr[2]"
          :referenceFile="arr[5]"
          :isLocal="arr[6]"          
      >
      </UploadOBTree>

      <!-- allOf Obj -->
      <UploadOBTree
          v-else-if="expandObject && arr[3] == 'ObjWithInherit'"
          :name="arr[0]"
          :children="subClassChildren(file.file, arr[4], arr[1], arr[5])"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :isObj="true"
          :parent=name
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[5]"
          :isLocal="arr[6]"          
      ></UploadOBTree> 

      <UploadOBTree
          v-else-if="expandElement && !(arr[3] == 'ObjWithInherit' || arr[3] == 'TaxonomyElement' || arr[3] == 'Object')"
          :isObj="false"
          :name="arr[0]"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :parent="name"
          type="element"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[3]"
          :isLocal="arr[4]"          
      >
      </UploadOBTree>

      <!-- ^^^^ working ^^^^ -->

        <!-- working taxonomy element -->
        <!-- <UploadOBTree
          v-if="expandObject && arr[2]=='TaxonomyElement'"
          :name="arr[0]"
          :depth="depth + 1"
          :nodeDescription="arr[1].description"
          :parent=name
          type="element"
          :ref="objectRef(arr[0], file.fileName)"
          :nameRef="objectRef(arr[0], file.fileName)"
          :file="file"
        ></UploadOBTree> -->

        <!-- obj or AllOf obj -->
        <!-- <UploadOBTree
          v-if="expandObject && isNodeObject(child_name)"
          :name="child_name"
          :depth="depth + 1"
          :children="returnNodeChildren(child_name, item)"
          :nodeDescription="item.description"
          :isObj="true"
          :parent=name
          type="object"
          :ref="objectRef(child_name, file.fileName)"
          :nameRef="objectRef(child_name, file.fileName)"
          :subClassedNode="fromSuperClass(item)"
          :file="file"
        ></UploadOBTree> -->
        <!-- TaxonomyElement -->

        <!-- <UploadOBTree
          v-if="expandObject && arr[2]=='TaxonomyElement'"
          :name="arr[0]"
          :depth="depth + 1"
          :nodeDescription="arr[1].description"
          :parent=name
          type="element"
          :ref="objectRef(arr[0], file.fileName)"
          :nameRef="objectRef(arr[0], file.fileName)"
          :subClassedNode="fromSuperClass(item)"
          :importedNode="fromImport(item)"
          :file="file"
        ></UploadOBTree> -->
      </span>
    </span>

    <!-- <UploadOBTree
      v-if="expandObject"
      v-for="(item, child_name) in children"
      :name="child_name"
      :parent_name="parent_name"
      ref="child_name"
      :key="child_name"
      :depth="depth + 1"
    ></UploadOBTree> -->
  </div>
</template>

<script>
import * as miscUtilities from "../utils/miscUtilities"

export default {
  props: ["name", "children", "depth", "expandAllObjects", "parent_name", 
    "nodeDescription", "isObj", "parent", "type", "nameRef", "subClassedNode", 
    "importedNode", "file", "isTaxonomyElement", "referenceFile", "isLocal"
  ],
  name: "UploadOBTree",
  data() {
    return {
      expandObject: true,
      expandElement: false,
      isObject: Boolean(this.children),
      parents: this.parent
    };
  },
  created() {
    if (this.name == 'TaxonomyElement') {
      this.expandElement = true
    }

    // if (this.subClassedNode) {
    //   console.log('sub classed node: ')
    //   console.log(this.name)
    // }

  },
  computed: {
    shortenName() {
      if (this.name.length > 54) {
        return this.name.slice(0, 54).concat('...')
      } else {
        return this.name
      }
    },
    indent() {
      return { "padding-left": `${this.depth * 50}px` };
    },
    modalNodeID() {
      // console.log(this.$store.state.nodeCount);
      return "modal-add-child-" + this.$store.state.nodeCount;
    },
    isSelected() {
      // console.log('is selected computed')
      // console.log('this.$store.state.nameRef:')
      // console.log(this.$store.state.nameRef)
      // console.log('this.nameRef:')
      // console.log(this.nameRef)
      
      return this.$store.state.nameRef == this.nameRef;
    },
    toolTipID() {

      return "tooltip-id-" + this.name + "-" + this.parent_name;
    },    
    sortedObjects() {
      // console.log('upload OB in sorted objects: ')
      // console.log(this.children)
      let obj_lst = []
      let obj_lst_SC = []
      let el_lst = []
      let el_lst_SC = []
      let superClass_lst = []
      let subClass_obj = {}
      let immutable_OB = ["Value", "Unit", "Decimals", "Precision", "TaxonomyElement"]
      let nodeType = ''
      let immutable_lst = []
      let immutable_lst_SC = []
      let fromSuperClass = false
      let defnRef = ''
      let isLocal = true
      let refFileContext = 'LOCAL'
      let isTaxonomyElement = false


      let fileReference = this.file
      // console.log('uploadOBTree, sortedObj')
      // console.log("file, from parent: " + this.name)
      // console.log(this.file)
      // if (this.children) {
      //   console.log('children: ')
      //   console.log(this.children)
      // }

      // if (this.name == 'WeatherDataRecord') {
      //   console.log('in sorted obj (upload ob)')
      //   console.log(this.children)
      // }
      // console.log('sorted obj, all children:')
      // console.log(this.children)

      if (this.children) {
          Object.keys(this.children).forEach(key => {
            // console.log('sorted obj, child key: ' + key + '\nchild obj:')
            // console.log(this.children[key])
            isLocal = true
            fileReference = this.file.file
            // fileReference = this.children
            refFileContext = 'LOCAL'
            isTaxonomyElement = false

            // console.log('#################')
            // console.log('uploadOB, sortedobj, key')
            // console.log(key)
            // console.log('file: ')
            // console.log(fileReference)
            // console.log('name')
            // console.log(this.name)
            // console.log('children prop')
            // console.log(this.children)
            // console.log('~~~')

            if (!this.children[key]["referenceFile"]) {
              // console.log('1')
              defnRef = miscUtilities.getDefnRef(fileReference, key, this.name, this.$store.state.loadedFiles, this.children)
              refFileContext = miscUtilities.getRefFileContext(defnRef)
              if (refFileContext != 'LOCAL') {
                // console.log('~~~~~~~~~~~~')
                // console.log('upload ob, getting file reference: ')
                // console.log(defnRef)
                fileReference = this.$store.state.loadedFiles[refFileContext]["file"]
                isLocal = false
                // console.log(fileReference)
              }              
            } else {
              // console.log('2')
              fileReference = this.children[key]["referenceFile"]

              if (!fileReference[key]) {
                refFileContext = miscUtilities.getRefFileContext(this.children[key]["$ref"])
                fileReference = this.$store.state.loadedFiles[refFileContext]["file"]
              }

              isLocal = false
            }

            // if (this.children[key]["referenceFile"]) {
            //   console.log('$$$$$$$')
            //   console.log('children ref file')
            //   console.log(this.children[key]["referenceFile"])
            // }

            // console.log('sorted obj, uploadob: defn ref: ' + defnRef)
            // console.log('sorted obj, uploadob: refFileContext: ' + refFileContext)
            // console.log('sorted obj, uploadob: referenceFile: ')
            // console.log(fileReference)




            // console.log('8')
            fromSuperClass = false
            superClass_lst = []
            if ('fromSuperClass' in this.children[key]) {
              fromSuperClass = true
            }
// 
            // console.log('9')

            // console.log(fileReference)
            if (fileReference[key]["type"] == "object") {
              // console.log('uploadOB, sorted obj, in type object')
                // console.log("object keys and obj")
                // console.log(key)
                // console.log(this.children[key])
                // console.log("-----------")
                nodeType = "Object"
                // console.log('~~~~')
                // console.log('object')
                // console.log('~~~')
                if (fromSuperClass) {
                  if (isLocal) {
                    obj_lst_SC.push([key, fileReference[key], fromSuperClass, nodeType, fileReference, isLocal])
                  } else {
                    obj_lst_SC.push([key, fileReference[key], fromSuperClass, nodeType, fileReference, isLocal])
                  }
                } else {
                  if (isLocal) {
                    obj_lst.push([key, fileReference[key], fromSuperClass, nodeType, fileReference, isLocal])
                  } else {
                    obj_lst.push([key, fileReference[key], fromSuperClass, nodeType, fileReference, isLocal])
                  }
                }
            } else if (fileReference[key]["allOf"]) {
                // console.log('uploadOB, sorted obj, in type allOf')
                // console.log('reference file all of obj: ')
                // console.log(fileReference[key]["allOf"])

                // console.log('~~~~')
                // console.log('allOf')
                // console.log('~~~')
                // console.log('allOf obj: ')
                // console.log(fileReference[key]["allOf"])
                for (let i in fileReference[key]["allOf"]) {
                    // console.log('all of 1')
                    if (fileReference[key]["allOf"][i]["$ref"]) {
                        superClass_lst.push(fileReference[key]["allOf"][i]["$ref"])
                    } else {
                        subClass_obj = fileReference[key]["allOf"][i]
                    }
                }
                // console.log('uploadob, sorted obj, superclass lst: ')
                // console.log(superClass_lst)
                // console.log('check tax elem check on superclass lst: ')
                // console.log(superClass_lst.includes('#/components/schemas/TaxonomyElement'))
                nodeType = false

                // check if superclass includes taxonomy element:
                for (let i in superClass_lst) {
                  if (superClass_lst[i].includes('#/components/schemas/TaxonomyElement')) {
                    isTaxonomyElement = true
                  }
                }

                if (isTaxonomyElement) {
                  // console.log('uploadob, sorted obj, is tax elem')
                  nodeType = 'TaxonomyElement'
                  if (fromSuperClass) {
                    el_lst_SC.push([key, subClass_obj, fromSuperClass, nodeType, superClass_lst, fileReference, isLocal])  
                  } else {
                    el_lst.push([key, subClass_obj, fromSuperClass, nodeType, superClass_lst, fileReference, isLocal])  
                  }
                } else {
                  // console.log('uploadob, sorted obj, is obj w/ inheritance')
                  nodeType = 'ObjWithInherit'
                  if (fromSuperClass) {
                    obj_lst_SC.push([key, subClass_obj, fromSuperClass, nodeType, superClass_lst, fileReference, isLocal])  
                  } else {
                    obj_lst.push([key, subClass_obj, fromSuperClass, nodeType, superClass_lst, fileReference, isLocal])
                  }
                }
                // console.log('all of FIN')
            } else {
              // console.log('upload ob, sorted obj, type immutable lst')
              immutable_lst.push([key, fileReference[key], fromSuperClass, fileReference, isLocal])
            }
          })

          obj_lst.sort()
          obj_lst_SC.sort()

          el_lst.sort()
          el_lst_SC.sort()

          immutable_lst.sort()

          // if (this.name == 'WeatherDataRecord') {
          //   console.log('in sorted obj (upload ob)')
          //   console.log(el_lst.concat(el_lst_SC).concat(obj_lst).concat(obj_lst_SC).concat(immutable_lst))
          // }

          // console.log('fin uploadOB sortedObjf')
          // console.log(el_lst.concat(el_lst_SC).concat(obj_lst).concat(obj_lst_SC).concat(immutable_lst))

          return el_lst.concat(el_lst_SC).concat(obj_lst).concat(obj_lst_SC).concat(immutable_lst)
      } 
    },
  },
  methods: {
    toggleExpandObject() {
      this.expandObject = !this.expandObject;
      this.expandElement = !this.expandElement;
    },
    toggleExpandElement() {
      this.expandElement = !this.expandElement;
    },
    collapse() {
      this.expandObject = false;
    },
    expand() {
      this.expandObject = true;
    },
    showAddChildModal() {
      // console.log("Add child");
      this.$store.commit("showAddChildModal", this.parent_name);
    },
    showEditNodeModal() {
      // console.log("Edit node modal");
      this.$store.commit({
        type: "showEditNodeModal",
        parent_name: this.parent_name,
        is_object: this.isObject,
        node_name: this.name
      });
    },
    showDeleteNodeModal() {
      // console.log("Delete node, from tree:");
      // console.log("Parent name: " + this.parent);
      this.$store.commit({
        type: "showDeleteNodeModal",
        node_name: this.name,
        parent_name: this.parent,
        isObject: this.isObject
      });
    },
    toggleSelect() {
      // console.log('in toggleSelect uploadOB: ')
      // console.log('name: '+ this.name + '\ntype: ' + this.type)
      this.$store.commit("toggleSelectDefinitionNode")
      this.$store.commit("showDetailedView")
      // console.log(this.file)
      // console.log('**** Is local? ****')
      // console.log(this.isLocal)

      this.$store.commit({
        type: 'selectNode',
        nodeName: this.name,
        nodeParent: this.parent,
        nodeType: this.type,
        nameRef: this.nameRef,
        nodeDescription: this.nodeDescription,
        isSubClassedNode: this.subClassedNode,
        isTaxonomyElement: this.isTaxonomyElement,
        selectedFileName: this.file.fileName,
        referenceFile: this.referenceFile,
        isLocal: this.isLocal
      })
      // console.log('toggle select in uploadOBTree: ' + this.parent)

      // console.log("toggle select: " + this.name)
    },
    objectRef(nodeName, fileName) {
      return fileName + "-" + nodeName;
    },

    // checks if node is obj, returns t or f
    isNodeObject(child_name) {
      if (this.file.file[child_name]) {
        if ((this.file.file[child_name]["type"] == "object" || this.file.file[child_name]["allOf"]) 
          && !miscUtilities.isTaxonomyElement(file.file, child_name)) {
          // if (this.$store.state.schemaFile[child_name]["allOf"]) {
          //   console.log(this.$store.state.schemaFile[child_name]["allOf"])
          // }
          return true
        } else {
          return false
        }   
      }     
      // if (this.$store.state.schemaFile[child_name]["type"] == "object" || this.$store.state.schemaFile[child_name]["allOf"]) {
      //   // if (this.$store.state.schemaFile[child_name]["allOf"]) {
      //   //   console.log(this.$store.state.schemaFile[child_name]["allOf"])
      //   // }
      //   return true
      // } else if (this.$store.state.xbrlFile[child_name]){
      //   return false
      // }
    },

    //returns children object from referenced (no unreferenced objects will be found, because this is below top level)
    returnNodeChildren(child_name, child_obj) {
      let temp_child_obj = {}
      // console.log("uploadOBTree, subclassednode: " + this.subClassedNode)
      // if (this.subClassedNode) {
      //   if (this.$store.state.schemaFile[child_name]["properties"]) {
      //     temp_child_obj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[child_name]["properties"]))
      //     Object.keys(temp_child_obj).forEach( key => {
      //         // console.log("key in deepcopy superclass: " + key)
      //         temp_child_obj[key].fromSuperClass = true
      //     })
      //     // console.log("in ret node child, childname: " + child_name)
      //     // console.log(temp_child_obj)
      //     return temp_child_obj
      //   } else {
      //     // return children merging superClassed objects / elements with obj's children
      //     // child_name is the name of the object, just need to return merge of children + superclass children
          
      //   }
      // }

      // console.log(child_obj)
      // if (child_obj["fromSuperClass"]) {
        
        // org
      // } else {
      // if (this.$store.state.schemaFile[child_name]["properties"]) {
      //   temp_child_obj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[child_name]["properties"]))
      //   Object.keys(temp_child_obj).forEach( key => {
      //       // console.log("key in deepcopy superclass: " + key)
      //       temp_child_obj[key].fromSuperClass = true
      //   })
      //   // console.log("in ret node child, childname: " + child_name)
      //   // console.log(temp_child_obj)
      //   return temp_child_obj
      // } else {
      //   // return children merging superClassed objects / elements with obj's children
      //   // child_name is the name of the object, just need to return merge of children + superclass children
      //   for (let i in this.$store.state.schemaFile[child_name]["allOf"]) {
      //     if (this.$store.state.schemaFile[child_name]["allOf"][i]["properties"]) {
      //       temp_child_obj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[child_name]["allOf"][i]["properties"]))
      //       Object.keys(temp_child_obj).forEach( key => {
      //           // console.log("key in deepcopy superclass: " + key)
      //           temp_child_obj[key].fromSuperClass = true
      //       })
      //       return temp_child_obj
      //     }
      //   }
      // }
      // }
      let superClass_lst = []
      if (this.file.file[child_name]["properties"]) {
        temp_child_obj = JSON.parse(JSON.stringify(this.file.file[child_name]["properties"]))
        if (child_obj["fromSuperClass"]) {
          Object.keys(temp_child_obj).forEach( key => {
              // console.log("key in deepcopy superclass: " + key)
              temp_child_obj[key].fromSuperClass = true
          })
        }

        // console.log("in ret node child, childname: " + child_name)
        // console.log(temp_child_obj)
        return temp_child_obj
      } else {
        // return children merging superClassed objects / elements with obj's children
        // child_name is the name of the object, just need to return merge of children + superclass children
        for (let i in this.file.file[child_name]["allOf"]) {
          if (this.file.file[child_name]["allOf"][i]["properties"]) {
            temp_child_obj = JSON.parse(JSON.stringify(this.file.file[child_name]["allOf"][i]["properties"]))
            if (child_obj["fromSuperClass"]) {
              Object.keys(temp_child_obj).forEach( key => {
                  // console.log("key in deepcopy superclass: " + key)
                  temp_child_obj[key].fromSuperClass = true
              })
            }
          } else {
            superClass_lst.push(this.file.file[child_name]["allOf"][i]["$ref"])
          }
        }
        return {...temp_child_obj, ...miscUtilities.getSuperClassChildren(this.file.file, superClass_lst, temp_child_obj)}
      }
    },
    fromSuperClass(childNode) {
      // console.log(childNode["$ref"])
      // console.log(childNode)
      if (childNode["fromSuperClass"]) {
        // console.log("node is from superclass")
        return true
      } else {
        return false
      }
    },
    fromImport(node) {
      if (node["$ref"]) {
        if (node["$ref"].includes("xbrl_all_elements")) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    getNodeDescription(nodeObj) {
        return nodeObj["description"]
    },
    subClassChildren(file, superClassRef, subClassObj, referenceFile) {
      // console.log('~~~~~')
      // console.log('subclasschildren, uploadob')
      // console.log('parent: ' + this.name)
      // console.log('file: ')
      // console.log(file)
      // console.log('superClassRef' + superClassRef)
      // console.log('subClassObj: ')
      // console.log(subClassObj)
      // console.log('referenceFile: ')
      // console.log(referenceFile)
      // console.log('~~~~~')

      if (referenceFile) {
        return miscUtilities.getSuperClassChildren(referenceFile, superClassRef, subClassObj, referenceFile, null, this.$store.state.loadedFiles)
      } else {
        return miscUtilities.getSuperClassChildren(file, superClassRef, subClassObj, referenceFile, null, this.$store.state.loadedFiles)
      }
    },
    defnRef(nodeName, fileName) {
      let defnRef = miscUtilities.generateUniqueRef(nodeName, fileName, this.name)
      return defnRef
    }
  },
  watch: {
    expandAllObjects() {
      if (this.expandAllObjects == true) {
        this.expandObject = true;
        this.expandElement = true
      } else {
        this.expandObject = false;
        this.expandElement = false
      }
    }
  }
};
</script>

<style>
.checkbox-s {
  margin-left: 8px;
}

.icon-expandable {
  margin-bottom: 3px;
}

.taxonomy-element-icon-expandable {
  margin-bottom: 3px;
  padding: 6px;
}

.options {
  display: inline-flex;
  justify-content: space-between;
  width: 46px;
  padding-left: 9px;
  bottom: -6px;
  visibility: hidden;
}

.element-div:hover .options {
  visibility: visible;
}

.element-div {
  margin-bottom: -8px;
  margin-left: 15px;
}

.element-div:focus {
  color: red;
}

.clickable {
  cursor: pointer;
}

.node-wrapper {
  border-bottom: #d3d3d3 solid 1px;
  height: 25px;

}

.subClassSignifier {
  font-style: italic;
}

.importedNodeSignifier {
  font-style: italic;
  font-weight: bold;
}
</style>