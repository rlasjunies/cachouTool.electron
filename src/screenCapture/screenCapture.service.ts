import { ipcRenderer, desktopCapturer, screen } from "electron";
import * as evtDef from "../share/eventDef";
import * as path from "path";
import * as fs from "fs";
import { consoleLogMain } from "../share/helper.renderer";

export function getMainSource(inDesktopCapturer: Electron.DesktopCapturer, inScreen: Electron.Screen, done: (source: Electron.DesktopCapturerSource) => void) {
    const options: Electron.DesktopCapturerOptions = {
        types: ["screen"],
        thumbnailSize: inScreen.getPrimaryDisplay().workAreaSize
    };

    inDesktopCapturer.getSources(options, (err: Error, sources: Electron.DesktopCapturerSource[]) => {
        if (err) consoleLogMain(`Cannot capture screen: ${err.message} \n ${err.stack}`);

        const isMainSource = (source: Electron.DesktopCapturerSource, index, arr) => source.name === "Entire Screen" || source.name === "Screen 1";

        done( sources.filter(isMainSource)[0] );
    });
}

export function writeScreenshot(png: Buffer, filePath: string) {
    fs.writeFile(filePath, png, err => {
        if ( err ) consoleLogMain(`Failed to write screen: ${err.message}`);
        consoleLogMain(`[screenCapture.service] screen shot taken:${filePath}`);
    });
}