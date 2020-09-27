import { app, Menu, ipcMain, Tray, BrowserWindow, clipboard, globalShortcut, MenuItem } from "electron";
import * as screenCapture from "./screenCapture/screenCapture.constructor";
import * as screenHistory from "./history/history.constructor";
import * as favorites from "./favoris/favoris.constructor";
import * as webview from "./webview/wv.constructor";
import * as evtDef from "./share/eventDef";
import * as path from "path";

let windows: Electron.BrowserWindow[] = [];
let appTray: Electron.Tray;
let screenCaptureWin: Electron.BrowserWindow;
let screenHistoryWin: Electron.BrowserWindow;

let win: Electron.BrowserWindow;
app.on("ready", () => {

    // screenCaptureWin = screenCapture.screenConstructor(app);
    // windows.push(screenCaptureWin);
    // screenHistoryWin = screenHistory.screenConstructor(app);
    // windows.push(screenHistoryWin);

    // win = webview.screenConstructor("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
    // // win = createWinLocally("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
    // windows.push(win);

    // const ytdWin = ytDownload.screenConstructor(app);
    // windows.push(ytdWin);

    // win.webContents.send("test", "4" + "tyuiop");

    globalShortcut.register("Ctrl+Alt+1", () => {
        console.log(`app.getAppPath():${app.getAppPath()}`);

        // TODO: configure the folder where is stored the files
        // windows[0].webContents.send(evtDef.SCREENCAPTURE_CLICKED, path.join(app.getAppPath(), "screenshots"));
        // screenCaptureWin.webContents.send(evtDef.SCREENCAPTURE_CLICKED, path.join(app.getAppPath(), "screenshots"));
    });

    addTray();
    addTrayMenu([]);

    const favoriteWin = favorites.screenConstructor(app);
    windows.push(favoriteWin);
});

app.on("will-quit", _ => {
    globalShortcut.unregisterAll();
    windows.forEach(window => window.close());
    appTray.destroy();
});

ipcMain.on(evtDef.MAIN_CONSOLE_LOG, (evt, message) => {
    console.log(message);
});

// ipcMain.on(evtDef.YOUTUBE_NAVIGATE, (evt, s) => {
//     console.log("[main] youtube navigate:", s);
//     screenHistoryWin.webContents.send(evtDef.YOUTUBE_NAVIGATE, s);
// });


ipcMain.on(evtDef.WEBVIEW_NEW_WINDOW_REQUESTED, (evt, s) => {
    console.log("[main] new-window-request", s);

    let newBrowserWindow = webview.screenConstructor(s);
    // windows.push(win);
    // newBrowserWindow.webContents.send(evtDef.WEBVIEW_NAVIGATE_TO, s);
});

function addTray() {
    appTray = new Tray(__dirname + "\\..\\assets\\trayIcon.jpg");
    appTray.setToolTip("Clipboard history");

}

function addTrayMenu(stack: string[]) {
    // const MENU_ITEM_MAC_LENGTH = 20;

    const trayMenuTemplate: Electron.MenuItemConstructorOptions[] =
        [
            {
                label: "Favorites",
                click: () => {
                    const favoriteWin = favorites.screenConstructor(app);
                    windows.push(favoriteWin);
                }
            },
            { type: "separator" },
            {
                label: "Quit",
                click: _ => { app.quit(); }
            }
        ];
    // const trayMenuTemplate = createMenuTemplate(stack).concat(trayMenuTemplateInit);

    const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setContextMenu(trayMenu);

    // function createMenuTemplate(inStack: string[]): Electron.MenuItemConstructorOptions[] {
    //     const menuIfEmptyStack: Electron.MenuItemConstructorOptions[] = [
    //         {
    //             label: "<empty>",
    //             enabled: false
    //         }
    //     ];
    //     let menuTemplate: Electron.MenuItemConstructorOptions[] = [];

    //     if (inStack.length === 0) {
    //         menuTemplate = menuIfEmptyStack;
    //     } else {
    //         menuTemplate = inStack.map(createMenuItemTemplate);
    //     }

    //     return menuTemplate;

    //     function createMenuItemTemplate(stackItem: string, index: number) {
    //         let menuItemTemplate: Electron.MenuItemConstructorOptions;

    //         menuItemTemplate = {
    //             label: `${index} - ${formatMenuItem(stackItem)}`,
    //             click: _ => { clipboard.writeText(stackItem); }
    //         };

    //         return menuItemTemplate;
    //     }
    // }

    // function formatMenuItem(stackItem: string): string {
    //     return stackItem.length >= MENU_ITEM_MAC_LENGTH ? stackItem.slice(0, MENU_ITEM_MAC_LENGTH) + "..." : stackItem;
    // }
}


console.log("Electron app started");