import * as electron from "electron";

const app = electron.app;

let mainWindow: Electron.BrowserWindow;

app.on("ready", _ => {
    // console.log("electron is ready");
    mainWindow = new electron.BrowserWindow({
    });
    
    mainWindow.on("closed", _ => {
        console.log("mainWindow closed");
        mainWindow = null;
    });
});


