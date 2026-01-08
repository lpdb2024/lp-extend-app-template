import { boot } from "quasar/wrappers";
import { Notify } from "quasar";
import { v4 as uuidv4 } from "uuid";
import DBConfirm from "components/common-ui/DBConfirm.vue";
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
import AppTitle from "components/common-ui/AppTitle.vue";
import CardHeader from "components/common-ui/CardHeader.vue";
import SelectFile from "components/Selectors/SelectFile.vue";
import ToolTip from "components/common-ui/ToolTip.vue";
import ExtButtonGroup from "components/common-ui/ExtButtonGroup.vue";
// FieldContainer
import FieldContainer from "components/common-ui/FieldContainer.vue";
// import PromptConfig from 'components/prompt-config.vue'
Notify.registerType("lpFail", {
  icon: "warning",
  progress: true,
  color: "white",
  iconColor: "red",
  textColor: "grey-8",
  classes: "lpFail",
  actions: [
    {
      icon: "close",
      color: "grey-8",
      "aria-label": "Dismiss",
    },
  ],
});
Notify.registerType("lpSuccess", {
  icon: "o_check_circle",
  progress: true,
  color: "white",
  iconColor: "green",
  textColor: "grey-8",
  classes: "lpSuccess",
  actions: [
    {
      icon: "close",
      color: "grey-8",
      "aria-label": "Dismiss",
    },
  ],
});
Notify.registerType("lpInfo", {
  icon: "o_info",
  progress: true,
  color: "white",
  iconColor: "info",
  textColor: "grey-8",
  classes: "lpSuccess",
  actions: [
    {
      icon: "close",
      color: "grey-8",
      "aria-label": "Dismiss",
    },
  ],
});
const wrap = (text: string, limit: number) => {
  if (!text) return;
  if (text.length > limit) return `${text.substring(0, limit - 3)}...`;
  return text;
};

export default boot(({ app }) => {
  app.config.globalProperties.$uuid = uuidv4();
  app.component("CardHeader", CardHeader);
  app.component("SelectFile", SelectFile);
  app.component("DBConfirm", DBConfirm);
  app.component("AppTitle", AppTitle);
  app.component("ToolTip", ToolTip);
  // app.component('db-prompt-config', PromptConfig)
  app.component("FieldContainer", FieldContainer);
  app.component("ExtButtonGroup", ExtButtonGroup);
});

export { wrap };
