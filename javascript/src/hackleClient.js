import Devtools from "@hackler/javascript-devtools";
import HackleManager from "./module/web-view-integration";

const webAppManager = new HackleManager();

export const hackleClient = webAppManager.createInstance(
  import.meta.env.VITE_SDK_KEY,
  {
    debug: true,
    devTool: Devtools,
  }
);
