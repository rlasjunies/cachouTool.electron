import { BrowserWindow } from "electron";

export function screenConstructor(app: Electron.App): Electron.BrowserWindow {
    let win = new BrowserWindow({
        width: 600,
        height: 800,
        resizable: false,
        frame: false,
        show: false
    });

    win.openDevTools();

    win.loadURL(`file://${__dirname}/screenCapture.html`);
    win.on("close", _ => {
        console.log("screenCapture windows closed!");
        win = null;
    });

    return win;