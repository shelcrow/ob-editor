import Vue from "vue";
import VueRouter from "vue-router";
import OBEditor from "../views/OBEditor.vue";
import DevSandbox from "../views/DevSandbox.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/ob-editor"
  },
  {
    path: "/ob-editor",
    name: "ob-editor",
    component: OBEditor
  },
  {
    path: "/dev-sandbox",
    name: "dev-sandbox",
    component: DevSandbox
  }
];

const router = new VueRouter({
  routes
});

export default router;