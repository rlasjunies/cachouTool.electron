import * as electron from "electron";
import {countDown} from "./countDown.service";

const app = electron.app;
const ipc = electron.ipcMain;

let mainWindow: Electron.BrowserWindow;

app.on("ready", _ => {
    // console.log("electron is ready");
    mainWindow = new electron.BrowserWindow({
    });


    mainWindow.loadURL(`file://${__dirname}/countDown.html`);
    mainWindow.on("closed", _ => {
        console.log("mainWindow closed");
        mainWindow = null;
    });
});

ipc.on("countDownStartClicked", _ => {
    console.log("countDownStart clicked");

    countDown( counterValue => {
        // console.log("countDown callback");

        mainWindow.webContents.send("countDown", counterValue);
    });
});