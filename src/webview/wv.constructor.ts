import { BrowserWindow, ipcMain } from "electron";
import * as evtDef from "../share/eventDef";
import * as lprr from "../share/helper.renderer";
import * as lprm from "../share/helper.main";
// let win: Electron.BrowserWindow;

export function screenConstructor(url: string): Electron.BrowserWindow {
// function createWinLocally(url: string): Electron.BrowserWindow {
    const browserWindow = new BrowserWindow({
        width: 1200,
        height: 1200,
        resizable: true,
        frame: true,
        show: true
    });


    // win.loadURL(url);
    browserWindow.on("close", _ => {
        console.log("-----------------------------> webview windows closed!");
        // lprr.consoleLogMain("-----------------------------> webview windows closed!");
        lprm.consoleLogMain("-----------------------------> webview windows closed!");
        // win = null;
    });

    browserWindow.on("show", _ => {
        console.log("-----------------------------> webview windows show!");
        lprr.consoleLogMain("-----------------------------> webview windows show!");
        lprm.consoleLogMain("-----------------------------> webview windows show!");
        // browserWindow.webContents.send("test", "2" + url);
    });

    browserWindow.on("ready-to-show", _ => {
        // lprr.consoleLogMain("-----------------------------> webview windows ready-to-show!");
        // console.log("-----------------------------> webview windows ready-to-show!");
        lprr.consoleLogMain("-----------------------------> webview windows ready-to-show!");
        lprm.consoleLogMain("-----------------------------> webview windows ready-to-show!");
        // console.log("8888888888888");
        // browserWindow.webContents.send("test", "2" + url);
    });
    // ipcMain.emit("test", "1" + url);
    browserWindow.loadURL(`file://${__dirname}/wv.template.html`);
    // browserWindow.openDevTools();
    browserWindow.webContents.send("navigate-to", url);
    // win.webContents.send("test", "https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
return browserWindow;
}