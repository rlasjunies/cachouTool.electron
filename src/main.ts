import * as electron from "electron";
import { countDown } from "./countDown.service";

const app = electron.app;
const ipc = electron.ipcMain;

let windows: Electron.BrowserWindow[] = [];

app.on("ready", _ => {
    // console.log("electron is ready");
    [1, 2, 3].forEach(_ => {
        let win = new electron.BrowserWindow({
        });


        win.loadURL(`file://${__dirname}/countDown.html`);
        win.on("closed", _ => {
            console.log("mainWindow closed");
            win = null;
        });

        windows.push(win);
    })
});

ipc.on("countDownStartClicked", _ => {
    console.log("countDownStart clicked");

    countDown(counterValue => {
        // console.log("countDown callback");

        windows.forEach( win => {
            win.webContents.send("countDown", counterValue);
        })
    });
});