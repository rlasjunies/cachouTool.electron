import { ipcMain} from "electron";
import * as evtDef from "./eventDef";

export function consoleLogMain(message: string) {
    console.log(message);
    console.log("[renderer] " + message);
}