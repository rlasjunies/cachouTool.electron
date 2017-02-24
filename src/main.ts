import * as electron from "electron";
import {countDown} from "./countDown.service";

const app = electron.app;

let mainWindow: Electron.BrowserWindow;

app.on("ready", _ => {
    // console.log("electron is ready");
    mainWindow = new electron.BrowserWindow({
    });

    countDown();

    mainWindow.loadURL(`file://${__dirname}/countDown.html`);
    mainWindow.on("closed", _ => {
        console.log("mainWindow closed");
        mainWindow = null;
    });
});


