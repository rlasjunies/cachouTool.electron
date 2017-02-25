import { ipcRenderer } from "electron";
import * as evtDef from "./eventDef";
import * as captureSrv from "./capture.service";

// console.log("screenCapture renderer loaded!");
ipcRenderer.on(evtDef.SCREENCAPTURE_CLICKED, _ => {
    // console.log("SCREENCAPTURE_CLICKED dans renderer screen Capture");

    ipcRenderer.send(evtDef.MAIN_CONSOLE_LOG, "SCREENCAPTURE_CLICKED dans renderer screen Capture");
});
