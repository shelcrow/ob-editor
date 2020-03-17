<template>
  <div class="file-load-tabs">
    <b-card no-body>
      <b-tabs card>
        <!-- Render Tabs, supply a unique `key` to each tab -->
        <b-tab v-for="i in tabs" :key="'dyn-tab-' + i" :title="i.fileName">
          {{ i.file }}
          <b-button size="sm" variant="danger" class="float-right" @click="closeTab(i)">
            Close file
          </b-button>
        </b-tab>

        <!-- New Tab Button (Using tabs-end slot) OLD -->
        <!-- <template v-slot:tabs-end>
          <b-nav-item @click.prevent="newTab" href="#"><b>+</b></b-nav-item>
        </template> -->

        <template v-slot:tabs-end>
          <b-nav-item @click="showModal=true" href="#"><b>+</b></b-nav-item>
        </template>

        <!-- Render this if no tabs -->
        <template v-slot:empty>
          <div class="text-center text-muted">
            There are no open files<br>
            Import a new file using the <b>+</b> button above.
          </div>
        </template>
      </b-tabs>
    </b-card>
    <div id="modal-container">
      <b-modal id="modal-center" v-model="showModal">
        <template v-slot:modal-header>
          <div id="modal-header-">
            <h5 id="modal-header-inline"> Load Schema </h5>
            <v-icon
              name="info-circle"
              id="info-circle-"
              v-b-popover.hover.right="'Choose an OpenAPI schema file from your own system or load a master copy from the database. Default setting is read/write, checkbox read only if you want otherwise'"
            />
          </div>
        </template>
        <template v-slot:modal-footer>
          <div class="w-100">
            <b-button
              variant="primary"
              class="float-right"
              @click="loadFile"
              :disabled="!file"
            >
              Open
            </b-button>
            <b-button
              variant="danger"
              class="float-right"
              @click="cancelLoadModal"
            >
              Cancel
            </b-button>
          </div>
        </template>
        <div id="modal-tabs-container">
          <b-tabs content-class="mt-3" id="modal-tabs" no-fade v-model="tabIndex">
            <div id="modal-tabs-inside">
              <b-tab title="From Local" active>
                <div class="tab-container">
                  <div id="file-selector-container">
                    <b-form-file
                        v-model="file"
                        :state="Boolean(file)"
                        placeholder="Choose your OpenAPI Schema File..."
                        v-if="!file"
                    ></b-form-file>
                    <span id="selected-file-txt" v-else>
                      Selected file: 
                      <strong>
                        {{ file ? file.name : '' }}
                      </strong>
                    </span> 
                    <br />
                    <span id="readonly-checkbox" v-if="file">
                      <b-form-checkbox
                        v-model="readOnly"
                        name="checkbox-1"
                        value="true"
                        unchecked-value="false"
                      >
                        Read only
                      </b-form-checkbox>
                    </span> 
                    <span id="unSelectFile-btn" v-if="file">
                      <b-button @click="unSelectFile">
                        Unselect File
                      </b-button>  
                    </span>                
                  </div>
                  <div class="error-container">
                    <b-alert id="file-duplicate-error" v-model="fileAlreadyOpened" variant="danger" dismissible>
                      File already opened. Cannot open the same file twice.
                    </b-alert>
                  </div>
                </div>
              </b-tab>
              <b-tab title="From Database">    
                <div class="database-selector-container">
                  <div class="database-selector-list">
                    <li v-for="(value, name, index) in dbList" id="db-in-list" @click="selectDBFile(index, name, value)" :class="{'selected-node': index == selectedIndex}">
                      <span id="db-list-name">
                        {{ name }}
                      </span>
                    </li>
                  </div>
                  <div class="database-selector-list-information">
                    <span v-if="selectedMasterFileInfo">
                      <p> {{ selectedMasterFileInfo }} </p>
                    </span>
                    <span id="readonly-checkbox" v-if="selectedMasterFileName">
                      <b-form-checkbox
                        v-model="readOnly"
                        name="checkbox-2"
                        value="true"
                        unchecked-value="false"
                      >
                        Read only
                      </b-form-checkbox>
                    </span>
                  </div>  
                </div>      
              </b-tab>
            </div>
          </b-tabs>
        </div>
      </b-modal>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        tabs: [],
        tabCounter: 0,
        showModal: false,
        file: null,
        tabIndex: 1,
        readOnly: false,
        selectedIndex: null,
        selectedMasterFileName: null,
        selectedMasterFileInfo: null,
        dbList: {
          "Solar Taxonomy 2019-09-20": {
            information: "This is the latest release of the Orange Button Solar Taxonomy",
            fileName: "xbrl_all_elements.json"
          },
          "Master OB OpenAPI File": {
            information: "This is just an example, and has not yet been implemented.",
            fileName: "example"
          }
        },
        fileAlreadyOpened: false,
      }
    },
    methods: {
      closeTab(x) {
        for (let i = 0; i < this.tabs.length; i++) {
          if (this.tabs[i] === x) {
            this.tabs.splice(i, 1)
          }
        }
      },
      // newTab() {
      //   this.tabs.push(this.tabCounter++)
      // },
      selectDBFile(index, dbSchemaKey, dbSchemaValue) {
        this.selectedIndex = index
        this.selectedMasterFileName = dbSchemaKey
        this.selectedMasterFileInfo = dbSchemaValue.information
      },
      unSelectFile() {
        this.file = null;
      },
      loadFile() {
        let file_obj = { 
          fileName: this.file.name
        }

        let reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = () => {
            file_obj["file"] = JSON.parse(reader.result).components.schemas
        }
        file_obj["file"] = JSON.stringify(file_obj["file"])
        // console.log("file obj: ")
        // console.log(file_obj["file"])

        // console.log('load file: ')

        let check_duplicate_file = false

        for (let i in this.tabs) {
          // console.log('tab obj: ')
          // console.log(i)
          // console.log('tab file name: ' + i.fileName)
          // console.log('file obj file name: ' + file_obj.fileName)
          if (this.tabs[i].fileName == file_obj.fileName) {
            check_duplicate_file = true
          }
        }

        if (check_duplicate_file) {
          this.fileAlreadyOpened = true
        } else {
          this.tabs.push(file_obj)
          this.showModal = false
        }

      },
      cancelLoadModal() {
        this.showModal = false
      }
    },
    watch: {
      showModal() {
        this.file = null
        this.fileAlreadyOpened = false
      },
      tabIndex() {
        this.readOnly = false
        this.file = null
        this.selectedIndex = null
        this.selectedMasterFileInfo = null
        this.selectedMasterFileName = null
      },
      readOnly() {
        // console.log(this.readOnly)
      },
      file() {
        if (this.file) {
          // console.log(this.file.name) 
        } else {
          // console.log(this.file)
        }
      },
      selectedIndex() {
        this.readOnly = false
      }
    }
  }
</script>

<style>
.modal-tabs-container {
}

#modal-center___BV_modal_body_ {
  padding: 0px;
}

#modal-center___BV_modal_header_ {
  border-bottom: none;
}

#modal-tabs-inside {
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  height: 300px;
}

#modal-header- {
}

#modal-header-inline {
  display: inline-block;
}

#info-circle- {
  margin-left: 6px;
  margin-bottom: 5px;
  height: 18px;
  width: 18px;

}

.was-validated .custom-file-input:invalid ~ .custom-file-label, .custom-file-input.is-invalid ~ .custom-file-label {
  border-color: #dee2e6 !important;
}

#selected-file-txt {
  display: flex;
  justify-content: center;
  align-items: center;
}

#readonly-checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
}

.database-selector-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.database-selector-list {
  grid-column: 1 / 2;
  border: 1px solid black;
  margin: 10px;
  margin-top: 0px;
  height: 280px;
}

.database-selector-list-information {
  grid-column: 2 / 3;
}

#db-in-list {
    list-style: none;
    border-bottom: 1px solid black;
}

#db-in-list {
  padding-left: 5px;
}

#file-duplicate-error {
  margin-top:0px;
}

.alert {
  margin-bottom: 0px !important;
}

.tab-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

}

.tab-pane {
  height: 100%;
}

#unSelectFile-btn {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;}

</style>