import { ipcRenderer, desktopCapturer, screen } from "electron";
import * as evtDef from "../share/eventDef";
import * as path from "path";
import * as fs from "fs";
import { consoleLogMain } from "../share/helper.renderer";
import * as srv from "./screenCapture.service";

ipcRenderer.on(evtDef.SCREENCAPTURE_CLICKED, onCapture);

export function onCapture(evt, targetPath: string) {
    srv.getMainSource(desktopCapturer, screen, source => {
        consoleLogMain(`[onCapture] - ${targetPath}`);

        const png = source.thumbnail.toPNG();

        createFolderIfNotExists(targetPath);
        const filePath = createFileName(targetPath);

        srv.writeScreenshot(png, filePath);
    });
}

function createFolderIfNotExists(folderName: string) {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
}

function createFileName( folderName: string ) {
    // return path.join(folderName, new Date() + ".png");
    return path.join(folderName, new Date().getMilliseconds() + ".png");
}