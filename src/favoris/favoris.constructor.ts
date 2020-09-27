import { BrowserWindow } from "electron";

export function screenConstructor(app: Electron.App): Electron.BrowserWindow {
    let win = new BrowserWindow({
        alwaysOnTop: true,
        width: 800,
        height: 600,
        resizable: true,
        frame: true,
        show: true,
        transparent: false
    });

    win.webContents.openDevTools();

    win.loadURL(`file://${__dirname}/favoris.html`);
    win.on("close", _ => {
        console.log("favorites windows closed!");
    });

    win.on("ready-to-show", () => {
        console.log("ready to show favorites!");
    });

    win.on("show", () => {
        console.log("ready to show favorites!");
    });

    return win;
}