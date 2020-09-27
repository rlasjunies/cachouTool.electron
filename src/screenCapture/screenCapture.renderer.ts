import { ipcRenderer, desktopCapturer, screen } from "electron";
import * as evtDef from "../share/eventDef";
import * as path from "path";
import * as fs from "fs";
import { consoleLogMain } from "../share/helper.renderer";
import * as srv from "./screenCapture.service";
import {ensureDirSync} from "fs-extra";

ipcRenderer.on(evtDef.SCREENCAPTURE_CLICKED, onCapture);

export function onCapture(evt: Electron.Event, targetPath: string) {
    srv.getMainSource(desktopCapturer, screen, source => {
        consoleLogMain(`[onCapture] - ${targetPath}`);

        const png = source.thumbnail.toPNG();

        ensureDirSync(targetPath);
        const filePath = createFileNameUnique(targetPath);

        srv.writeScreenshot(png, filePath);
    });
}

function createFileNameUnique( folderName: string ) {
    // return path.join(folderName, new Date() + ".png");
    return path.join(folderName, new Date().getMilliseconds() + ".png");
}