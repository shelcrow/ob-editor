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
export function hasInheritance(defnObj) {
    if (defnObj["allOf"]) {
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

export function getPropertiesObj(objWithInheritance, objType) {
    if (objType == 'TaxonomyElement') {
        for (let i in objWithInheritance["allOf"]) {
            if (objWithInheritance["allOf"][i]["type"]) {
                return objWithInheritance["allOf"][i]
            }
        }
    } else if (objType == 'ObjWithInherit') {
        for (let i in objWithInheritance["allOf"]) {
            if (objWithInheritance["allOf"][i]["properties"]) {
                return objWithInheritance["allOf"][i]
            }
        }
    }
}

// returns an array of all superclasses of the definition
export function getSuperClasses(JSONFile, definitionName) {
	
}

//builds the array of inherited and inherited inheritence recursively
//implements transitive inheritance and returns as an object
export function getSuperClassChildren(JSONFile, superClassRefArr, subClassObj, referenceFile, key, loadedFiles) {
    // console.log('########')
    // console.log('JSON file:')
    // console.log(JSONFile)
    // console.log('in get super class children')
    // console.log('superClassArr')
    // console.log(superClassRefArr)
    // console.log('subclassObj')
    // console.log(subClassObj)
    // console.log('referenceFile')
    // console.log(referenceFile)
    // console.log('key: ' + key)
    // console.log('########')
    let superClassChildren = {}
    let superClassName = ""
    let temp_super_children = {}
    let temp_super_class_ref = []
    let file = ''
    let tempRefFileName = ''

    if (referenceFile) {
        file = referenceFile
    } else {
        file = JSONFile
    }

    for (let i in superClassRefArr) {
        superClassName = superClassRefArr[i].slice(superClassRefArr[i].lastIndexOf("/") + 1)
        // console.log(superClassName)

        tempRefFileName = getRefFileContext(superClassRefArr[i])
        if (tempRefFileName != 'LOCAL') {
            file = loadedFiles[tempRefFileName]["file"]
            // console.log('new ref file')
            // console.log(file)
        }



        if (file[superClassName]["allOf"]) {
            // might cause bug here if not using a deep copy
            // need to get both inherited objects and elements
            for (let i in file[superClassName]["allOf"]) {
                temp_super_children = {}
                if (file[superClassName]["allOf"][i]["properties"]) {
                    temp_super_children = JSON.parse(JSON.stringify(file[superClassName]["allOf"][i]["properties"]))
                    Object.keys(temp_super_children).forEach( key => {
                        // console.log("key in deepcopy superclass: " + key)
                        temp_super_children[key].fromSuperClass = true
                        temp_super_children[key].referenceFile = file

                    })
                } else {
                    temp_super_class_ref.push(file[superClassName]["allOf"][i]["$ref"])
                    // only way to do show children of a superclasses' superclass is to recursively build it.
                    // if a superclasses' superclass has a superclass then recursion is the only way to build it.
                    // for now superclassing is "simple"
                    // create a miscutility recursive function to build out chain of inherited children
                    // let superClassInheritedSuperClass = this.$store.state.schemaFile[superClassName]["allOf"][i].slice(this.$store.state.schemaFile[superClassName]["allOf"][i].lastIndexOf("/") + 1)
                }

                if (temp_super_class_ref.length != 0) {
                    temp_super_children = {...temp_super_children, ...getSuperClassChildren(file, temp_super_class_ref, file[superClassName])}
                }

                superClassChildren = {...superClassChildren, ...temp_super_children}
            }
        } else {
            let deepSuperClassObj = JSON.parse(JSON.stringify(file[superClassName]["properties"]))
            Object.keys(deepSuperClassObj).forEach( key => {
                // console.log("key in deepcopy superclass: " + key)
                deepSuperClassObj[key].fromSuperClass = true
                deepSuperClassObj[key].referenceFile = file
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
    // console.log({...subClassObj["properties"], ...superClassChildren})
    // console.log('in superClass Children misc util: ')
    // console.log({...subClassObj["properties"], ...superClassChildren})

    // console.log('in superClass children')
    // console.log({...subClassObj["properties"], ...superClassChildren})
    return {...subClassObj["properties"], ...superClassChildren}    
}

// checks to see if inheritance/add member will cause infinite loop of inheritance/adding member
// returns bool. true for can inherit, false for cant inherit
// a subclass cannot inherit from a superclass that has the subclass as an object member or as a superclass, or has the subclass in one of the object members or their superclasses
export function checkInfiniteLoopErr(JSONFile, subClassName, superClassName) {
    // console.log('in inf loop error')
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
    // console.log("in get all superclasses")
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
    // console.log('in checkSuperClassObjConflict')
    // console.log('json file')
    // console.log(JSONFile)
    // console.log('defnName')
    // console.log(defnName)
    let defnTopLevelConflicts = getAllSuperClassesInDefn(JSONFile, defnName) 

    // console.log(1)
    for (let i in defnTopLevelConflicts) {
        defnTopLevelConflicts = defnTopLevelConflicts.concat(getTopLevelObjects(JSONFile, defnTopLevelConflicts[i]))
    }
    defnTopLevelConflicts = defnTopLevelConflicts.concat(getTopLevelObjects(JSONFile, defnName))
    defnTopLevelConflicts = [...new Set(defnTopLevelConflicts)]
    // console.log(defnTopLevelConflicts)
    // console.log(2)

    let addingSuperClassOrObjectName = [superClassOrObjectNameToAdd]
    addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getAllSuperClassesInDefn(JSONFile, superClassOrObjectNameToAdd))
    // console.log(3)

    for (let i in addingSuperClassOrObjectName) {
        addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getTopLevelObjects(JSONFile, addingSuperClassOrObjectName[i]))
    }
    addingSuperClassOrObjectName = addingSuperClassOrObjectName.concat(getTopLevelObjects(JSONFile, superClassOrObjectNameToAdd))
    addingSuperClassOrObjectName = [...new Set(addingSuperClassOrObjectName)]
    // console.log(addingSuperClassOrObjectName)

    // console.log(4)

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

// takes a file and returns all the top level elements and objects; used for the addMember functionality
export function getAllElementsFlat(file) {
    // console.log('getAllNodesFlat in miscUtiltiies: ')
    // console.log(file)
    let allElementsFlat = []
    Object.keys(file).forEach( key => {
        // console.log(key)
        allElementsFlat.push(key)
    }) 
    return allElementsFlat
}

// take a file and returns all the top level objects; used for the superclass list in AddInheritance
export function getAllObjectsFlat(file) {

    let allObjectsFlat = []
    Object.keys(file).forEach( key => {
        if (!isTaxonomyElement(file, key)) {
            if (isDefnObj(file, key)) {
                allObjectsFlat.push(key)
            }
        }
    })
    return allObjectsFlat
}

export function isTaxonomyElement(file, defnName) {
    let retBool = false
    if (file[defnName]["allOf"]) {
        for (let i in file[defnName]["allOf"]) {
            if (file[defnName]["allOf"][i]["$ref"] == "#/components/schemas/TaxonomyElement") {
                retBool = true
            }
        }   
    }

    return retBool
}

export function isExternalRef(refStr) {
    if (refStr[0] == "#") {
        return false
    } else {
        return true
    }
}

export function returnRefsRequired(fileObj) {
    let refs = []
    // let document = fileObj.file 
    
    for (let i in fileObj.file) {
        if (fileObj.file[i]["$ref"]) {
            if (isExternalRef(fileObj.file[i]["$ref"])) {
                refs.push(fileObj.file[i]["$ref"].slice(0, fileObj.file[i]["$ref"].lastIndexOf("#")))
            }
        } else if (fileObj.file[i]["type"] == "object") {
            for (let j in fileObj.file[i]["properties"]) {
                if (isExternalRef(fileObj.file[i]["properties"][j]["$ref"])) {
                    refs.push(fileObj.file[i]["properties"][j]["$ref"].slice(0, fileObj.file[i]["properties"][j]["$ref"].lastIndexOf("#")))
                }
            }
        } else if (fileObj.file[i]["allOf"]) {
            for (let j in fileObj.file[i]["allOf"]) {
                if (fileObj.file[i]["allOf"][j]["$ref"]) {
                    if (isExternalRef(fileObj.file[i]["allOf"][j]["$ref"])) {
                        refs.push(fileObj.file[i]["allOf"][j]["$ref"].slice(0, fileObj.file[i]["allOf"][j]["$ref"].lastIndexOf("#")))
                    }
                }
            }
        } 
    }

    refs = [...new Set(refs)]

    return refs
    
}

// checks if files are opened to support the file you want to load
// input: array w/ refs, tabs array with opened files
// output: returns missing refs

export function getMissingRefs(refsArr, fileArr) {
    let loadedFiles = []
    let missingRefs = []
    for (let i in fileArr) {
        loadedFiles.push(fileArr[i].fileName) 
    }

    // console.log('loadedFiles') 
    // console.log(loadedFiles)

    for (let i in refsArr) {
        if (!loadedFiles.includes(refsArr[i])) {
            missingRefs.push(refsArr[i])
        }
    }

    return missingRefs
}

export function getDefnRef(file, defnName, parent, loadedFiles, childrenObj) {
    // console.log('getDefnRef, miscUtilities')
    // console.log('file: ')
    // console.log(file)
    // console.log('defnName: ' + defnName)
    // console.log('parent: ' + parent)
    // console.log('child obj: ')
    // console.log(childrenObj)

    // if it has parent, it is non-root
    // if (parent) {
    //     console.log('misc util, getDefnRef, file: ')
    //     console.log(file)
    //     console.log('misc util, defnname: ' + defnName)
    //     console.log('misc util, parent: ' + parent)
    
    // }

    let refFileName = ''


    // if (parent) {
    //     if (file[parent]["properties"][defnName]["$ref"]) {
    //         console.log('misc util, getdefn ref, 111:')
    //         console.log(file[parent]["properties"][defnName]["$ref"])
    //         refFileName = file[parent]["properties"][defnName]["$ref"].slice(0, file[parent]["properties"][defnName]["$ref"].lastIndexOf("#"))
    //         console.log('misc util, getdefnref: ')
    //         console.log(refFileName)
    //     }        
    // } else {
    //     if (file[defnName]["$ref"]) {
    //         refFileName = file[defnName]["$ref"].slice(0, file[defnName]["$ref"].lastIndexOf("#"))
    //     }
    // }


    // if (file[defnName]["$ref"]) {
    //     console.log('getdefnref 1')
    //     if (isExternalRef(file[defnName]["$ref"])) {
    //         refFileName = file[defnName]["$ref"].slice(0, file[defnName]["$ref"].lastIndexOf("#"))
    //     }
    // } else if (file[defnName]["type"] == "object") {
    //     console.log('getdefnref 2')
    //     for (let j in file[defnName]["properties"]) {
    //         if (isExternalRef(file[defnName]["properties"][j]["$ref"])) {
    //             refFileName = file[defnName]["properties"][j]["$ref"].slice(0, file[defnName]["properties"][j]["$ref"].lastIndexOf("#"))
    //         }
    //     }
    // } else if (file[defnName]["allOf"]) {
    //     console.log('getdefnref 1')
    //     for (let j in file[defnName]["allOf"]) {
    //         if (file[defnName]["allOf"][j]["$ref"]) {
    //             if (isExternalRef(file[defnName]["allOf"][j]["$ref"])) {
    //                 refFileName = file[defnName]["allOf"][j]["$ref"].slice(0, file[defnName]["allOf"][j]["$ref"].lastIndexOf("#"))
    //             }
    //         }
    //     }
    // } 

    // console.log('checking ref: ')
    // console.log((typeof file[defnName]["$ref"]) !== 'undefined')

    // if (parent) {
    //     refFileName = file[parent]["properties"][defnName]["$ref"]
    // } else {
    //     console.log('in root')
    //     if ((typeof file[defnName]["$ref"]) !== 'undefined') {
    //         console.log('getdefnref 1')
    //         refFileName = file[defnName]["$ref"]
    //     } else if (file[defnName]["type"] == "object") {
    //         console.log('getdefnref 2')
    //         for (let j in file[defnName]["properties"]) {
    //                 refFileName = file[defnName]["properties"][j]["$ref"]
    //         }
    //     } else if (file[defnName]["allOf"]) {
    //         console.log('getdefnref 1')
    //         for (let j in file[defnName]["allOf"]) {
    //             if (file[defnName]["allOf"][j]["$ref"]) {
    //                 refFileName = file[defnName]["allOf"][j]["$ref"]
    //             }
    //         }
    //     } 
    // }

    // if (parent) {
    //     if (file[parent][defnName]["$ref"]) {
    //         console.log('getdefnref 1')
    //         refFileName = file[parent]["$ref"]
    //     } else if (file[parent][defnName]["type"] == "object") {
    //                 refFileName = file[parent][defnName]["properties"][j]["$ref"].slice(0, file[parent][defnName]["properties"][j]["$ref"].lastIndexOf("#"))
    //     } else if (file[parent][defnName]["allOf"]) {
    //         console.log('getdefnref 1')
    //         for (let j in file[parent][defnName]["allOf"]) {
    //             if (file[parent][defnName]["allOf"][j]["$ref"]) {
    //                     refFileName = file[parent][defnName]["allOf"][j]["$ref"].slice(0, file[parent][defnName]["allOf"][j]["$ref"].lastIndexOf("#"))
    //             }
    //         }
    //     } 
    // } else {
    //     if (file[defnName]["allOf"]) {
    //         console.log('111')
    //         console.log('file')
    //         console.log(file)
    //         console.log('defnName: ' + defnName)
    //         console.log(file[defnName]["allOf"][0])
    //         for (let j in file[defnName]["allOf"]) {
    //             console.log(j)
    //             if (file[defnName]["allOf"][j]["$ref"]) {
    //                 console.log('222')
    //                 refFileName = file[defnName]["allOf"][j]["$ref"]
    //             }
    //         }        
    //     } else if (file[defnName]["type"]) {
    //         // # means the reference is local
    //         refFileName = '#'
    //     }
    // }

    if (parent) {
        if (file[parent]) {
            if (file[parent]["properties"]) {
                // console.log('1 parent')
                refFileName = file[parent]['properties'][defnName]["$ref"]
            } else if (file[parent]["allOf"]) {
                // console.log('2 parent')
                for (let j in file[parent]["allOf"]) {
                    if (file[parent]["allOf"][j]["properties"]) {
                            refFileName = file[parent]["allOf"][j]["properties"][defnName]['$ref']
                    }
                }
            } else if (file[parent]["$ref"]) {
                let parentRef = file[parent]["$ref"]
                parentRef = getRefFileContext(parentRef)
                if (parentRef == 'LOCAL') {
                    refFileName = "#"
                } else {
                    refFileName = loadedFiles[parentRef]["file"][parent]["properties"][defnName]["$ref"]
                }
            } else {
                refFileName = "#"
                // console.log('8 parent')
            }
        } else if (childrenObj[defnName]) {
            refFileName = childrenObj[defnName]["$ref"]
        } 

    } else {
        // console.log('7 no parent')
        // if (file[defnName]["allOf"]) {
        //     console.log('3 all of not parent')
        //     // console.log('111')
        //     // console.log('file')
        //     // console.log(file)
        //     // console.log('defnName: ' + defnName)
        //     // console.log(file[defnName]["allOf"][0])
        //     for (let j in file[defnName]["allOf"]) {
        //         // console.log(j)
        //         if (file[defnName]["allOf"][j]["$ref"]) {
        //             // console.log('222')
        //             refFileName = file[defnName]["allOf"][j]["$ref"]
        //         }
        //     }        
        // } 
        if (file[defnName]["$ref"]) {
            // console.log('4 all of no parent')
            // # means the reference is local
            refFileName = file[defnName]["$ref"]
        } else {
            // console.log('5 all of no parent')
            refFileName = "#"
        }
    }



    // console.log('getDefnRef fin')
    // console.log(file[defnName])
    // console.log(refFileName)

    return refFileName
}

export function getRefFileContext(refString) {
    if (refString[0] == '#') {
        return 'LOCAL'
    } else {
        return refString.slice(0, refString.lastIndexOf("#"))
    }
}


export function getFileNameFromNameRef(nameRef) {

}


export function generateUniqueRef(defnName, fileName, parent) {
    let returnRef = ''
    if (parent) {
        returnRef = defnName + "-" + parent + "-" + fileName
    } else {
        returnRef = defnName + "-" + fileName
    }
    // returnRef = returnRef + "-" + Math.random().toString(36).replace('0.', '')
    return returnRef
}
