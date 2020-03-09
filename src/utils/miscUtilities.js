/*

miscUtilities.js contains utility functions reused in multiple places throughout the application

*/

import Vuex from "vuex";
import Vue from "vue";
import store from "../store/index"


//	returns if the object definition is an object or not
// "duplicate function, use canInherit or isDefnObj, not both"
export function isDefnObj(JSONFile, defnName) {
	if (JSONFile[defnName]["type"] == "object" || JSONFile[defnName]["allOf"]) {
		return true
	} else {
		return false
	}
}

// returns if it currently has inheritance
export function hasInheritance(JSONFile, definitionName) {
    if (JSONFile[definitionName]["allOf"]) {
        return true
    } else {
        return false
    }
}

// returns if it can have inheritance. only objects can have inheritance
export function canInherit(JSONFile, definitionName) {
    if (JSONFile[definitionName]["allOf"] || JSONFile[definitionName]["type"] == "object") {
        return true
    } else {
        return false
    }
}

// returns an array of all superclasses of the definition
export function getSuperClasses(JSONFile, definitionName) {
	
}

//builds the array of inherited and inherited inheritence recursively
//implements transitive inheritance and returns as an object
export function getSuperClassChildren(JSONFile, superClassRefArr, subClassObj) {
    let superClassChildren = {}
    let superClassName = ""
    let temp_super_children = {}
    let temp_super_class_ref = []

    for (let i in superClassRefArr) {
        superClassName = superClassRefArr[i].slice(superClassRefArr[i].lastIndexOf("/") + 1)
        temp_super_class_ref = []
        if (JSONFile[superClassName]["allOf"]) {
            // might cause bug here if not using a deep copy
            // need to get both inherited objects and elements
            for (let i in JSONFile[superClassName]["allOf"]) {
                temp_super_children = {}
                if (JSONFile[superClassName]["allOf"][i]["properties"]) {
                    temp_super_children = JSON.parse(JSON.stringify(JSONFile[superClassName]["allOf"][i]["properties"]))
                    Object.keys(temp_super_children).forEach( key => {
                        // console.log("key in deepcopy superclass: " + key)
                        temp_super_children[key].fromSuperClass = true
                    })
                } else {
                    temp_super_class_ref.push(JSONFile[superClassName]["allOf"][i]["$ref"])
                    // only way to do show children of a superclasses' superclass is to recursively build it.
                    // if a superclasses' superclass has a superclass then recursion is the only way to build it.
                    // for now superclassing is "simple"
                    // create a miscutility recursive function to build out chain of inherited children
                    // let superClassInheritedSuperClass = this.$store.state.schemaFile[superClassName]["allOf"][i].slice(this.$store.state.schemaFile[superClassName]["allOf"][i].lastIndexOf("/") + 1)
                }

                if (temp_super_class_ref.length != 0) {
                    temp_super_children = {...temp_super_children, ...getSuperClassChildren(JSONFile, temp_super_class_ref, JSONFile[superClassName])}
                }

                superClassChildren = {...superClassChildren, ...temp_super_children}
            }
        } else {
            let deepSuperClassObj = JSON.parse(JSON.stringify(JSONFile[superClassName]["properties"]))
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
    // let test_obj = {...subClassObj["properties"], ...superClassChildren}
    // console.log('obeditor, subclasschildren: ')
    // console.log("in miscUtitlies, subclasschildren recursive, subclassobj:")
    // console.log(subClassObj)
    // console.log("final obj?:")
    // console.log(test_obj)
    // console.log({...subClassObj["properties"], ...superClassChildren})
    return {...subClassObj["properties"], ...superClassChildren}    
}

// checks to see if inheritance/add member will cause infinite loop of inheritance/adding member
// returns bool. true for can inherit, false for cant inherit
// a subclass cannot inherit from a superclass that has the subclass as an object member or as a superclass, or has the subclass in one of the object members or their superclasses
export function checkInfiniteLoopErr(JSONFile, subClassName, superClassName) {
    console.log('in checkinf loop')
    let allSuperClasses = getAllSuperClassesInDefn(JSONFile, superClassName)
    let allObjs = getAllObjInDefn(JSONFile, superClassName)
    let combinedObjsSuperClasses = allSuperClasses.concat(allObjs)
    let checkBoth = []
    let retArr = []
    // console.log(combinedObjsSuperClasses)
    for (let i in combinedObjsSuperClasses) {
        // console.log(i)

        // get all superclasses from child objects
        checkBoth = checkBoth.concat(getAllSuperClassesInDefn(JSONFile, combinedObjsSuperClasses[i]))

        // get all objects from superclasses
        checkBoth = checkBoth.concat(getAllObjInDefn(JSONFile, combinedObjsSuperClasses[i]))
    }

    // console.log('combined objs')
    // console.log(combinedObjsSuperClasses)
    checkBoth = checkBoth.concat(combinedObjsSuperClasses)

    // console.log('checkboth')
    // console.log(checkBoth)
    retArr = [...new Set(checkBoth)]

    // console.log('retArr')
    // console.log(retArr)

    return retArr.includes(subClassName)
}

//returns a list of all superclass refs and superclass refs of superclasses refs recursively
// input: json file, name of defn as string
// output: arr of defn (objects) strings
export function getAllSuperClassesInDefn(JSONFile, superClassName) {
    console.log("in get all superclasses")
    let allSuperClassRefs = []
    let hasSuperClass = false

    if (JSONFile[superClassName]["allOf"]) {
        // console.log('get all super class')
        for (let i in JSONFile[superClassName]["allOf"]) {
            if (JSONFile[superClassName]["allOf"][i]["$ref"]) {
                hasSuperClass = true
                let superClassSubStringIndex = JSONFile[superClassName]["allOf"][i]["$ref"].lastIndexOf("/") + 1
                let superClassSubString = JSONFile[superClassName]["allOf"][i]["$ref"].slice(superClassSubStringIndex)
                allSuperClassRefs.push(superClassSubString)
                // console.log('subclass: ' + superClassName)
                // console.log('superclass: ' + superClassSubString)
            }
        }
    }
    // console.log('didnt make it')
    // console.log(hasSuperClass)
    if (hasSuperClass) {
        for (let i in allSuperClassRefs) {
            allSuperClassRefs = allSuperClassRefs.concat(getAllSuperClassesInDefn(JSONFile, allSuperClassRefs[i]))
        }
        for (let i in allSuperClassRefs) {
            if (allSuperClassRefs[i] == undefined) {
                allSuperClassRefs.splice(i, 1)
            }
        }
        return allSuperClassRefs
    }
    if (allSuperClassRefs.length == 0) {
        return []
    } 
}

// returns array of all objects and nested objects in the definition
// input: json file, name of defn as string
// output: arr of defn (objects) strings
export function getAllObjInDefn(JSONFile, defnName) {
    // console.log("in get all objs")
    // console.log('defn name: ' + defnName)

    let allDefnObj = []
    if (JSONFile[defnName]["allOf"]) {
        for (let i in JSONFile[defnName]["allOf"]) {
            if (JSONFile[defnName]["allOf"][i]["properties"]) {
                for (let j in JSONFile[defnName]["allOf"][i]["properties"]) {
                    if (isDefnObj(JSONFile, j)) {
                        allDefnObj.push(j)
                    }
                }
            }
        }

    } else if (JSONFile[defnName]["properties"]) {
        for (let i in JSONFile[defnName]["properties"]) {
            if (isDefnObj(JSONFile, i)) {
                allDefnObj.push(i)
            }
        }
    }
    
    if (allDefnObj.length != 0) {
        for (let i in allDefnObj) {
            allDefnObj = allDefnObj.concat(getAllObjInDefn(JSONFile, allDefnObj[i]))
        }
    }

    return allDefnObj
}

//when adding an object member, check if it has already superclassed that object
//when adding a superclass, check if it has already 
// only need to check the top level for conflicts, don't need to check below that
// How to check for conflicts when adding a superclass or object to the defnObj:
// - does the defnObj have a superclass 
export function checkSuperClassObjConflict(JSONFile, defnName, superClassOrObjectNameToAdd) {
    console.log('check supr class obj')
    let defnTopLevelConflicts = getAllSuperClassesInDefn(JSONFile, defnName) 
    for (let i in defnTopLevelConflicts) {
        defnTopLevelConflicts = defnTopLevelConflicts.concat(getTopLevelObjects(JSONFile, defnTopLevelConflicts[i]))
    }
    defnTopLevelConflicts = defnTopLevelConflicts.concat(getTopLevelObjects(JSONFile, defnName))
    defnTopLevelConflicts = [...new Set(defnTopLevelConflicts)]
    // console.log(defnTopLevelConflicts)

    let addingSuperClassOrObjectName = [superClassOrObjectNameToAdd]
    addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getAllSuperClassesInDefn(JSONFile, superClassOrObjectNameToAdd))
    
    for (let i in addingSuperClassOrObjectName) {
        addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getTopLevelObjects(JSONFile, addingSuperClassOrObjectName[i]))
    }
    addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getTopLevelObjects(JSONFile, superClassOrObjectNameToAdd))
    addingSuperClassOrObjectName = [...new Set(addingSuperClassOrObjectName)]
    // console.log(addingSuperClassOrObjectName)


    let hasConflict = false
    // console.log('1: ' + hasConflict)
    // refactor this to be more efficient
    for (let i in defnTopLevelConflicts) {
        for (let j in addingSuperClassOrObjectName) {
            // console.log('i: ' + defnTopLevelConflicts[i] + '\nj: ' + addingSuperClassOrObjectName[j])

            if (defnTopLevelConflicts[i] == addingSuperClassOrObjectName[j]) {
                hasConflict = true
                // console.log('2: ' + hasConflict)
            }
        }
    }
    // console.log('3: ' + hasConflict)
    return hasConflict
}

export function getTopLevelObjects(JSONFile, defnName) {
    let topLevelObjs = []

    if (JSONFile[defnName]["allOf"]) {
        for (let i in JSONFile[defnName]["allOf"]) {
            if (JSONFile[defnName]["allOf"][i]["properties"]) {
                for (let j in JSONFile[defnName]["allOf"][i]["properties"]) {
                    if (isDefnObj(JSONFile, j)) {
                        topLevelObjs.push(j)
                    }
                }
            }
        }
    } else if (JSONFile[defnName]["properties"]) {
        for (let i in JSONFile[defnName]["properties"]) {
            if (isDefnObj(JSONFile, i)) {
                topLevelObjs.push(i)
            }
        }
    }

    return topLevelObjs
}