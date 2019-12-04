import Vue from "vue";
import Vuex from "vuex";


// Deletes all nodes recursively of the same node name
// used for deleting definition elements
export function deleteAllNodes(JSONFile, nodeName) {
    console.log(' in deleting all nodes ')
    Object.keys(JSONFile).forEach(key => {
        if (key == nodeName) {
            Vue.delete(JSONFile, key)
        } else if (JSONFile[key].properties) {
            deleteAllNodes(JSONFile[key].properties, nodeName)
        }
    })
}

//Remove single node from object. Removes every instance of the node which is in the object
export function deleteNode(JSONFile, nodeName, parentName) {
    Object.keys(JSONFile).forEach(key => {
        if (parentName == 'root') {
            if (key == nodeName) {
                Vue.delete(JSONFile, nodeName)
            }
        }
        if (key == parentName) {
            if (JSONFile[key]["properties"][nodeName]) {
                Vue.delete(JSONFile[key]["properties"], nodeName)
            }
        }

        if (JSONFile[key] != undefined && JSONFile[key].properties) {
            deleteNode(JSONFile[key].properties, nodeName, parentName)
        } 
    })
}


/// EDIT FUNCTIONS
/// What information are you allowed to edit?
/// 


//Edit node
export function editNode(JSONFile, nodeName, newType, newDocumentation) {
    // console.log("nodeName: " + nodeName)
    // console.log("nodeType: " + newType)
    // console.log("nodeDoc: " + newDocumentation)

    let nodeEdit = {
            "type": newType,
            "description": newDocumentation
    }

    Object.keys(JSONFile).forEach(key => {
        if (key == nodeName) {
            Vue.set(JSONFile, key, nodeEdit)
        }
    })

    // console.log(newNode)
    // Object.keys(JSONFile).forEach(key => {
    //     if (key == nodeName) {
    //         Vue.delete(JSONFile, key)
    //     } else if (JSONFile[key].properties) {
    //         editNode(JSONFile[key].properties, nodeName, newNodeName, newType, newDocumentation)
    //     }
    // })
}


//Edit object



/// CREATE NODES
///
///


//Create node
export function createNodeElement(JSONFile, nodeName, nodeType, nodeDescription) {

    let node_attr = {
        "type": nodeType,
        "description": nodeDescription
    }
    Vue.set(JSONFile, nodeName, node_attr)
}





//Create object
export function createNodeObject(JSONFile, objectName, objectDescription, elementForms) {
    let properties = {}
    for (let i in elementForms) {
        properties[elementForms[i].nodeName] = {
            "type": elementForms[i].nodeType,
            "description": elementForms[i].nodeDescription
        }
    }
    let obj_attr = {
        "type": "object",
        "description": objectDescription,
        "properties": properties
    }
    Vue.set(JSONFile, objectName, obj_attr)
}


//create list of all element definitions into array for use in selecting elements in object creation.
export function createArrayOfAllElementDefinitions(JSONFile, array) {
    Object.keys(JSONFile).forEach(key => {
        if (!JSONFile[key].properties) {
            array.push(key)
        }
    })
}



//add child to object whether element or object
//adding children to the top level object does not propagate throughout the reference objects
export function addChildToObject(JSONFile, parentName, childName, nodeType, childObj) {
    // console.log('in JSONEditor.js \n' + "parentname: " + parentName + "\nchildname: " + childName + "\nnodeType: " + nodeType)
    // console.log('Name of parent object ' + parentName + ' object to add to')
    // console.log(JSONFile[parentName].properties)
    // console.log('Name of child node: ' + childName + "\nChild object:") 
    // console.log(JSONFile[childName])
    // if (nodeType == 'object') {
    //     console.log('From JSONEditor: this is an object')
    //     Vue.set(JSONFile[parentName].properties, childName, JSONFile[childName])
    // } else {
    //     console.log('From JSONEditor: this is an element')
    //     Vue.set(JSONFile[parentName].properties, childName, JSONFile[childName])
    // }

    Object.keys(JSONFile).forEach(key => {
        // console.log("in recurison fxn start")
        // console.log(key)
        if (key == parentName) {
            // console.log(key + "key is the same")
            if (nodeType == 'object') {
                // console.log('From JSONEditor: this is an object')
                Vue.set(JSONFile[parentName].properties, childName, childObj)
            } else {
                // don't need to have an else statement for elements? because they can't have children. maybe remove.
                // console.log('From JSONEditor: this is an element')
                // console.log('\nparent obj:')
                // console.log(JSONFile[parentName])
                // console.log('\nchild name: ' + childName + '\nchildObject: ')
                // console.log(childObj)
                Vue.set(JSONFile[parentName].properties, childName, childObj)
            }
        } else if (JSONFile[key].properties) {
            // console.log(key + "key is not the same")
            addChildToObject(JSONFile[key].properties, parentName, childName, nodeType, childObj)
        }

        // if (JSONFile[key] != undefined && JSONFile[key].properties) {
        //     deleteNode(JSONFile[key].properties, nodeName, parentName)
        // } 
    })

}