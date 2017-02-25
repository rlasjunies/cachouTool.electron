import { ipcRenderer, desktopCapturer, screen } from "electron";
import * as evtDef from "./eventDef";

ipcRenderer.on(evtDef.SCREENCAPTURE_CLICKED, _ => {
    consoleLogMain("SCREENCAPTURE_CLICKED dans renderer screen Capture");

    getMainSource(desktopCapturer, screen, _ => {
        consoleLogMain("capture ok");
    } )
});

function consoleLogMain(message: string) {
    ipcRenderer.send(evtDef.MAIN_CONSOLE_LOG, message);
}

function getMainSource(inDesktopCapturer:Electron.DesktopCapturer, inScreen: Electron.Screen, done){
    const options: Electron.DesktopCapturerOptions = {
        types: ["screen"],
        thumbnailSize: inScreen.getPrimaryDisplay().workAreaSize
    };

    inDesktopCapturer.getSources(options, (err: Error, sources) => {
        if (err) consoleLogMain(`Cannot capture screen: ${err.message} \n ${err.stack}`);

        done();
    });

}