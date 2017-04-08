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

    win.openDevTools();

    win.loadURL(`file://${__dirname}/history.html`);
    win.on("close", _ => {
        console.log("history windows closed!");
        win = null;
    });

    return win;
}