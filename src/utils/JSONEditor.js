/*

JSONEditor.js contains functions related to manipulating OAS JSON files

*/

import Vue from "vue";
import Vuex from "vuex";
import * as miscUtilities from "./miscUtilities.js"
import newFileTemplate from "../assets/OB-OpenAPI-New-File-Template.json"


// Deletes all nodes recursively of the same node name
// used for deleting definition elements
export function deleteAllNodes(JSONFile, nodeName) {
    // console.log(' in deleting all nodes ')
    Object.keys(JSONFile).forEach(key => {
        if (key == nodeName) {
            Vue.delete(JSONFile, key)
        } else if (JSONFile[key].properties) {
            if (JSONFile[key]["properties"][nodeName]) {
                Vue.delete(JSONFile[key].properties, nodeName)
            }
        } else if (JSONFile[key]["allOf"]) {
            for (let i in JSONFile[key]["allOf"]) {
                if (JSONFile[key]["allOf"][i]["properties"]) {
                    if (JSONFile[key]["allOf"][i]["properties"][nodeName]) {
                        Vue.delete(JSONFile[key]["allOf"][i]["properties"], nodeName)
                    }
                }
                if (JSONFile[key]["allOf"][i]["$ref"]) {
                    let superClassName = JSONFile[key]["allOf"][i]["$ref"].slice(
                        JSONFile[key]["allOf"][i]["$ref"].lastIndexOf('/') + 1,
                        JSONFile[key]["allOf"][i]["$ref"].length)
                    if (superClassName == nodeName) {
                        Vue.delete(JSONFile[key]["allOf"], i)
                    }
                }
            }
        }
    })
    console.log('del nodes fin')
}

//Remove single node from object. Removes every instance of the node which is in the object
export function deleteNode(JSONFile, nodeName, parentName) {
    // console.log('node name: ' + nodeName)
    // console.log('parent name: ' + parentName)
    console.log('2')

    if (parentName == 'root') {
        Vue.delete(JSONFile, nodeName)
        for (let i in JSONFile) {
            if (JSONFile[i]["properties"]) {
                if (JSONFile[i]["properties"][nodeName]) {
                    Vue.delete(JSONFile[i]["properties"], nodeName)
                }
            } else if (JSONFile[i]["allOf"]) {
                for (let j in JSONFile[i]["allOf"]) {
                    if (JSONFile[i]["allOf"][j]["$ref"]) {
                        for (let k in JSONFile[i]["allOf"][j]["$ref"]) {
                            let superClassSubStringIndex = JSONFile[i]["allOf"][j]["$ref"][k].lastIndexOf("/") + 1
                            let superClassSubString = JSONFile[i]["allOf"][j]["$ref"][k].slice(superClassSubStringIndex)                 
                            if (superClassSubString == nodeName) {
                                Vue.delete(JSONFile[i]["allOf"][j]["$ref"], k)
                            }           
                        }
                    } else if (JSONFile[i]["allOf"][j]["properties"]) {
                        if (JSONFile[i]["allOf"][j]["properties"][nodeName]) {
                            Vue.delete(JSONFile[i]["allOf"][j]["properties"], nodeName)
                        }
                    }
                }
            }
        }
    } else {
        console.log('del node 1')
        console.log('parent name: ' + parentName + '\nnodeName: ' + nodeName)
        console.log(JSONFile[parentName])
        if (JSONFile[parentName]["properties"]) {
            // console.log("non-allOf")
            Vue.delete(JSONFile[parentName]["properties"], nodeName)
        } else {
            console.log("allOf (in del node")
            console.log('parent name: ' + parentName)
            console.log('nodeName: ' + nodeName)
            for (let i in JSONFile[parentName]["allOf"]) {
                if (JSONFile[parentName]["allOf"][i]["properties"]) {
                    Vue.delete(JSONFile[parentName]["allOf"][i]["properties"], nodeName)
                }
            }
        }
    }

    // Object.keys(JSONFile).forEach(key => {
    //     // if (parentName == 'root') {
    //     //     if (key == nodeName) {
    //     //         Vue.delete(JSONFile, nodeName)
    //     //     }
    //     // }
    //     if (key == parentName) {
    //         console.log("in")
    //         console.log('key ' + key)
    //         console.log('parentName ' + parentName)
    //         console.log('nodeName' + nodeName)

    //         console.log(JSONFile[key])
    //         if (JSONFile[key]["properties"]) {
    //             console.log("non-allOf")
    //             Vue.delete(JSONFile[key]["properties"], nodeName)
    //         } else {
    //             console.log("allOf")
    //             for (let i in JSONFile[key]["allOf"]) {
    //                 if (JSONFile[key]["allOf"][i]["properties"]) {
    //                     Vue.delete(JSONFile[key]["allOf"][i]["properties"], nodeName)
    //                 }
    //             }
    //         }
    //     }

    //     // if (JSONFile[key] != undefined && JSONFile[key].properties) {
    //     //     deleteNode(JSONFile[key].properties, nodeName, parentName)
    //     // } 
    // })
}

//Edit node
export function editNode(JSONFile, nodeName, newDescription) {
    console.log('in editNode json editor')
    let nodeEdit = {
            "description": newDescription,
    }
    if (miscUtilities.hasInheritance(JSONFile[nodeName])) {
        for (let i in JSONFile[nodeName]["allOf"]) {
            if (JSONFile[nodeName]["allOf"][i]["type"]) {

                JSONFile[nodeName]["allOf"][i]["description"] = newDescription

            }
        }
    } else if (JSONFile[nodeName]["type"] == "object") {
        nodeEdit.properties = JSONFile[nodeName]["properties"]
        nodeEdit.type = "object"
        Vue.set(JSONFile, nodeName, nodeEdit)
    } else {
        Vue.set(JSONFile, nodeName, nodeEdit)
    }
}

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
// if all non-top level elements/objects are references, do we need to add the child to anything other than the top level defn? probably not
export function addChildToObject(JSONFile, parentName, childName, nodeType, childObj) {

    // Object.keys(JSONFile).forEach(key => {
    //     if (key == parentName && JSONFile[key].properties) {
            // console.log("key match")
            // console.log("parent name: " + parentName)
            // console.log("parent obj: " + JSONFile[parentName])
            // console.log(JSONFile[parentName])

            // console.log("child name: " + childName)
            // console.log("child obj: " + childObj)
            // console.log(childObj)

    //         Vue.set(JSONFile[parentName].properties, childName, childObj)
    //     } else if (JSONFile[key].properties) {
    //         // console.log("recursing obj")
    //         addChildToObject(JSONFile[key].properties, parentName, childName, nodeType, childObj)
    //     }
    // })
    if (JSONFile[parentName]["allOf"]) {
        for (let i in JSONFile[parentName]["allOf"]) {
            if (JSONFile[parentName]["allOf"][i]["properties"]) {
                Vue.set(JSONFile[parentName]["allOf"][i]["properties"], childName, childObj)
            }
        }
    } else {
        Vue.set(JSONFile[parentName].properties, childName, childObj)
    }

}

// add superClass to object, making that object a subclass
export function addSuperClass(JSONFile, subClass, superClass) {
    let refExists = false
    let allOfArr = []
    let allOfObj = {}
    if (JSONFile[subClass]["allOf"] !== undefined) {
        for (let i of JSONFile[subClass].allOf) {
            if (i["ref"] == '#/components/schemas/' + superClass) {
                refExists = true
            }
        }
        if (!refExists) {
            JSONFile[subClass].allOf.push(
                { 
                    "$ref": "#/components/schemas/" + superClass
                }
            )
        }
    } else {
        allOfArr.push({
            "$ref": "#/components/schemas/" + superClass
        })
        // push deep clone. may need a better way to deep clone js objs. possibly lodash
        allOfArr.push(JSON.parse(JSON.stringify(JSONFile[subClass])))
        allOfObj = {
            "allOf": allOfArr
        }
        Vue.delete(JSONFile, subClass)
        Vue.set(JSONFile, subClass, allOfObj)
    }
}

export function removeSuperClass(JSONFile, subClassName, superClassName) {
    if (JSONFile[subClassName]["allOf"].length > 2) {
        // console.log("in more than 2")
        for (let i in JSONFile[subClassName]["allOf"]) {
            if (JSONFile[subClassName]["allOf"][i]["$ref"]) {
                if (JSONFile[subClassName]["allOf"][i]["$ref"].includes(superClassName)) {
                    Vue.delete(JSONFile[subClassName]["allOf"], i)
                }
            }
        }
    } else {
        // console.log("in less than 2")
        let temp_subClass_obj = {}
        for (let i in JSONFile[subClassName]["allOf"]) {
            if (JSONFile[subClassName]["allOf"][i]["type"]) {
                temp_subClass_obj = JSONFile[subClassName]["allOf"][i]
            }
        }
        Vue.set(JSONFile, subClassName, temp_subClass_obj)
    }
}

// add enumeration to definition element
export function addEnum(JSONFile, defnName, enumName) {
    let temp_enum = {}
    // console.log(JSONFile[defnName])
    // console.log(JSONFile[defnName]["enum"])
    for (let i in JSONFile[defnName]["allOf"]) {
        if (JSONFile[defnName]["allOf"][i]["type"]) {
            if (JSONFile[defnName]["allOf"][i]["enum"]) {
                JSONFile[defnName]["allOf"][i]["enum"].push(enumName)
            } else {
                temp_enum = [enumName]
                Vue.set(JSONFile[defnName]["allOf"][i], "enum", temp_enum)
            }
        }
      }   

    // if (JSONFile[defnName]["enum"]) {
    // } else {
    //     temp_enum = [enumName]
    //     Vue.set(JSONFile[defnName], "enum", temp_enum)
    // }
    // console.log(JSONFile[defnName]["enum"])
    // console.log(JSONFile[defnName])
}


// remove enumeration from definition element
export function removeEnum(JSONFile, defnName, enumName) {
    // console.log("remove enum: " + enumName)
    for (let i in JSONFile[defnName]["allOf"]) {
        if (JSONFile[defnName]["allOf"][i]["enum"]) {
            let enum_index = JSONFile[defnName]["allOf"][i]["enum"].indexOf(enumName)
            if (JSONFile[defnName]["allOf"][i]["enum"].length == 1) {
                console.log('json editor, removeEnum, 1:')
                Vue.delete(JSONFile[defnName]["allOf"][i], "enum")
            } else {
                console.log('json editor, removeEnum, 2:')
                console.log('enum index: ' + enum_index)
                console.log('enum obj')
                console.log(JSONFile[defnName]["allOf"][i])
                console.log(JSONFile[defnName]["allOf"][i]["enum"])

                Vue.delete(JSONFile[defnName]["allOf"][i]["enum"], enum_index)
            }
            // if (JSONFile[defnName]["allOf"][i]["enum"]) {
            //     JSONFile[defnName]["allOf"][i]["enum"].push(enumName)
            // } else {
            //     temp_enum = [enumName]
            //     Vue.set(JSONFile[defnName]["allOf"][i], "enum", temp_enum)
            // }
        }
    }   
}

export function createNewDefnFile(title, description, fileName) {
    // console.log('title: ' + title + '\ndescription: ' + description + '\nfilename: ' + filename)

    let returnNewFileObj = {}
    returnNewFileObj["fullFileForExport"] = newFileTemplate
    returnNewFileObj["file"] = returnNewFileObj["fullFileForExport"].components.schemas
    returnNewFileObj["fileName"] = fileName

    returnNewFileObj["fullFileForExport"]["info"]["title"] = title
    returnNewFileObj["fullFileForExport"]["info"]["description"] = description

    return returnNewFileObj

}