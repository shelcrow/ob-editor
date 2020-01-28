<template>
  <div class="ob-tree-container">
    <div
      class="node-wrapper"
      @click="toggleSelect"
      :style=" isSelected ? 'background-color: #89CFF0;' : '' "
    >
      <div class="element-div" :style="indent">
        <span @click="toggleExpand">
          <v-icon
            v-if="isObj && expandObject"
            name="minus-square"
            class="icon-expandable clickable"
          />
        </span>
        <span @click="toggleExpand">
          <v-icon
            v-if="isObj && !expandObject"
            name="plus-square"
            class="icon-expandable clickable"
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
          {{ name }}
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
    <span 
      v-for="(item, child_name) in children"
      :key="child_name"
    > 
      <UploadOBTree
        v-if="expandObject && isNodeObject(child_name)"
        :name="child_name"
        :depth="depth + 1"
        :children="returnNodeChildren(child_name, item)"
        :nodeDescription="item.description"
        :isObj="true"
        :parent=name
        type="object"
        :nameRef="objectRef(name, child_name)"
        :subClassedNode="fromSuperClass(item)"
      ></UploadOBTree>
      <UploadOBTree
        v-else-if="expandObject && !isNodeObject(child_name)"
        :name="child_name"
        :depth="depth + 1"
        :nodeDescription="item.description"
        :parent=name
        type="element"
        :nameRef="objectRef(name, child_name)"
        :subClassedNode="fromSuperClass(item)"
        :importedNode="fromImport(item)"
      ></UploadOBTree>
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
  props: ["name", "children", "depth", "expandAllObjects", "parent_name", "nodeDescription", "isObj", "parent", "type", "nameRef", "subClassedNode", "importedNode"],
  name: "UploadOBTree",
  data() {
    return {
      expandObject: true,
      isObject: Boolean(this.children),
      parents: this.parent
    };
  },
  computed: {
    indent() {
      return { "padding-left": `${this.depth * 50}px` };
    },
    modalNodeID() {
      // console.log(this.$store.state.nodeCount);
      return "modal-add-child-" + this.$store.state.nodeCount;
    },
    isSelected() {
      // console.log('is selected computed')
      return this.$store.state.nameRef == this.nameRef;
    },
    toolTipID() {

      return "tooltip-id-" + this.name + "-" + this.parent_name;
    },
    sortedObjects() {
      
    }
  },
  methods: {
    toggleExpand() {
      this.expandObject = !this.expandObject;
    },
    collapse() {
      this.expandObject = false;
    },
    expand() {
      this.expandObject = true;
    },
    showAddChildModal() {
      console.log("Add child");
      this.$store.commit("showAddChildModal", this.parent_name);
    },
    showEditNodeModal() {
      console.log("Edit node modal");
      this.$store.commit({
        type: "showEditNodeModal",
        parent_name: this.parent_name,
        is_object: this.isObject,
        node_name: this.name
      });
    },
    showDeleteNodeModal() {
      console.log("Delete node, from tree:");
      console.log("Parent name: " + this.parent);
      this.$store.commit({
        type: "showDeleteNodeModal",
        node_name: this.name,
        parent_name: this.parent,
        isObject: this.isObject
      });
    },
    toggleSelect() {
      this.$store.commit("toggleSelectDefinitionNode")
      this.$store.commit("showDetailedView")

      this.$store.commit({
        type: 'selectNode',
        nodeName: this.name,
        nodeParent: this.parent,
        nodeType: this.type,
        nameRef: this.nameRef,
        nodeDescription: this.nodeDescription,
        isSubClassedNode: this.subClassedNode
      })

      // console.log("toggle select: " + this.name)
    },
    objectRef(parent, child) {
      return parent + "-" + child;
    },

    // checks if node is obj, returns t or f
    isNodeObject(child_name) {
      if (this.$store.state.schemaFile[child_name]) {
        if (this.$store.state.schemaFile[child_name]["type"] == "object" || this.$store.state.schemaFile[child_name]["allOf"]) {
          // if (this.$store.state.schemaFile[child_name]["allOf"]) {
          //   console.log(this.$store.state.schemaFile[child_name]["allOf"])
          // }
          return true
        } else {
          return false
        }        
      } else if (this.$store.state.xbrlFile[child_name]) {
        return false
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
      if (this.$store.state.schemaFile[child_name]["properties"]) {
        temp_child_obj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[child_name]["properties"]))
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
        for (let i in this.$store.state.schemaFile[child_name]["allOf"]) {
          if (this.$store.state.schemaFile[child_name]["allOf"][i]["properties"]) {
            temp_child_obj = JSON.parse(JSON.stringify(this.$store.state.schemaFile[child_name]["allOf"][i]["properties"]))
            if (child_obj["fromSuperClass"]) {
              Object.keys(temp_child_obj).forEach( key => {
                  // console.log("key in deepcopy superclass: " + key)
                  temp_child_obj[key].fromSuperClass = true
              })
            }
          } else {
            superClass_lst.push(this.$store.state.schemaFile[child_name]["allOf"][i]["$ref"])
          }
        }
        return {...temp_child_obj, ...miscUtilities.getSuperClassChildren(this.$store.state.schemaFile, superClass_lst, temp_child_obj)}
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
    }
  },
  watch: {
    expandAllObjects() {
      if (this.expandAllObjects == true) {
        this.expandObject = true;
      } else {
        this.expandObject = false;
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