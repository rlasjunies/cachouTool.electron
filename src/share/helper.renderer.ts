import { ipcRenderer} from "electron";
import * as evtDef from "./eventDef";

export function consoleLogMain(message: string) {
    console.log(message);
    ipcRenderer.send(evtDef.MAIN_CONSOLE_LOG, "[renderer] " + message);
}