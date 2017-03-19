import { BrowserWindow } from "electron";

export function screenConstructor(app: Electron.App): Electron.BrowserWindow {
    let win = new BrowserWindow({
        width: 1500,
        height: 1500,
        resizable: true,
        frame: true,
        show: true,
        transparent: false
    });

    // win.openDevTools();

    win.loadURL(`file://${__dirname}/youtubeDownload.html`);
    win.on("close", _ => {
        console.log("youtubeDownload windows closed!");
        win = null;
    });

    return win;
}