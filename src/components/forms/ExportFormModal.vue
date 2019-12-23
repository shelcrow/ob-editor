<template>
    <div id="export-form-container">
        <b-modal id="export-modal" title="Export settings">

            <template v-slot:modal-footer="{ ok, cancel }">
                <b-button size="sm" variant="primary" @click="ok(); exportFile(); exportModalOpened()">
                    Save As
                </b-button>
                <b-button size="sm" variant="danger" @click="cancel(); exportModalOpened()">
                    Cancel
                </b-button>
            </template>        

            <b-form>
                <!-- <b-form-group
                    id="export-form-group-title"
                    label="Title:*"
                    label-for="export-input-title"
                >
                    <b-form-input
                        id="export-input-title"
                        v-model="exportForm.OASTitle"
                        placeholder="Enter title"
                        required
                    >

                    </b-form-input>
                </b-form-group>

                <b-form-group
                    id="export-form-group-description"
                    label="Description:"
                    label-for="export-input-description"
                >
                    <b-form-input
                        id="export-input-description"
                        v-model="exportForm.OASDescription"
                        placeholder="Enter description"
                    >
                        
                    </b-form-input>
                </b-form-group>

                <b-form-group
                    id="export-form-group-version"
                    label="Version:*"
                    label-for="export-input-version"
                >
                    <b-form-input
                        id="export-input-version"
                        v-model="exportForm.OASVersion"
                        placeholder="Enter version number"
                        required
                    >
                        
                    </b-form-input>
                </b-form-group> -->

                <b-form-group
                    id="export-form-filename"
                    label="File name:*"
                    label-for="export-input-filename"
                >
                    <b-form-input
                        id="export-input-filename"
                        v-model="exportForm.filename"
                        placeholder="Enter file name"
                        required
                    >
                        
                    </b-form-input>
                </b-form-group>
            </b-form>
            <!-- <p>*Required</p> -->
            <p>**Will save as .json</p>
        </b-modal>
    </div>
</template>

<script>
/*
OAS Fields: 
    info {
        For sure: title REQUIRED:"", description:"", version REQUIRED:""
        Add later, possibly: termsOfService, contact, license
    }

*/
export default {
    data() {
        return {
            exportForm: {
                OASDescription: null,
                OASTitle: null,
                OASVersion: null,
                filename: null
            }
        }
    },
    methods: {
        // validation does not occur because i have to link the formgroup and the modal together, or 
        exportFile() {
            for (let property in this.exportForm) {
                if (!this.exportForm[property]) {
                    this.exportForm[property] = "left blank"
                }
            }
            let exportObj = {
                type: "exportFile",
                filename: this.exportForm.filename,
                "info": {
                    "description": "Description placeholder",
                    "title": "Title placeholder",
                    "version": "Version placeholder"
                }
            }
            this.$store.commit(exportObj)
        },
        exportModalOpened() {
            this.$store.commit("toggleExportModal")
        }
    },
    watch: {
        // reset export form after closing modal
        // doesn't reset because the watch doesn't work for some reason
        "$store.state.exportModalOpened"() {
            console.log("watched")
            for (let property in this.exportForm) {
                this.exportForm[property] = null;
            }
        }
    }
}

</script>



<style>


</style>