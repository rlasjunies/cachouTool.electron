import { app, Menu, ipcMain, Tray, BrowserWindow, clipboard, globalShortcut } from "electron";
import * as screenCapture from "./screenCapture/screenCapture.constructor";
import * as screenHistory from "./history/history.constructor";
import * as webview from "./webview/wv.constructor";
import * as ytDownload from "./youtubeDownloadView/youtubeDownload.constructor";
import * as evtDef from "./share/eventDef";
import * as path from "path";

let windows: Electron.BrowserWindow[] = [];
let appTray: Electron.Tray;
let timerClipboardPolling: number;
let screenCaptureWin: Electron.BrowserWindow;
let screenHistoryWin: Electron.BrowserWindow;

let win: Electron.BrowserWindow;
app.on("ready", empty => {

     screenCaptureWin = screenCapture.screenConstructor(app);
     windows.push(screenCaptureWin);
     screenHistoryWin = screenHistory.screenConstructor(app);
     windows.push(screenHistoryWin);

    // win = webview.screenConstructor("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
    // // win = createWinLocally("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
    // windows.push(win);

    const ytdWin = ytDownload.screenConstructor(app);
    windows.push(ytdWin);

    // win.webContents.send("test", "4" + "tyuiop");

    globalShortcut.register("Ctrl+Alt+1", _ => {
        // console.log(`app.getAppPath():${app.getAppPath()}`);

        // TODO: configure the folder where is stored the files
        // windows[0].webContents.send(evtDef.SCREENCAPTURE_CLICKED, path.join(app.getAppPath(), "screenshots"));
        screenCaptureWin.webContents.send(evtDef.SCREENCAPTURE_CLICKED, path.join(app.getAppPath(), "screenshots"));
    });

    addTray();
    addTrayMenu([]);
    addClipboardManager();
});

app.on("will-quit", _ => {
    globalShortcut.unregisterAll();
    windows.forEach(window => window = null);
    appTray.destroy();
});

ipcMain.on(evtDef.MAIN_CONSOLE_LOG, (evt, message) => {
    console.log(message);
});

ipcMain.on(evtDef.YOUTUBE_NAVIGATE, (evt, s) => {
    console.log("[main] youtube navigate:", s);
    screenHistoryWin.webContents.send(evtDef.YOUTUBE_NAVIGATE, s);
});


ipcMain.on(evtDef.WEBVIEW_NEW_WINDOW_REQUESTED, (evt, s) => {
    console.log("[main] new-window-request", s);

    let newBrowserWindow = webview.screenConstructor(s);
    // windows.push(win);
    // newBrowserWindow.webContents.send(evtDef.WEBVIEW_NAVIGATE_TO, s);
});


function addClipboardManager() {
    const STACK_LENGTH = 10;
    let stack: string[] = [];

    checkClipboardPolling1sec(clipboard, clipboardChanged);

    function clipboardChanged(text: string) {
        stack = addToStack(text, stack);
        addTrayMenu(stack);
        // registerShortcuts(globalShortcut, clipboard, stack);
    }

    function registerShortcuts(inGlobalShortcut: Electron.GlobalShortcut, inClipboard: Electron.Clipboard, inStack: string[]) {
        inGlobalShortcut.unregisterAll();
        inStack.forEach(registerShortcut);

        function registerShortcut(stackItem: string, index: number) {
            inGlobalShortcut.register(`Ctrl+Alt+${index}`, _ => {
                inClipboard.writeText(stackItem);
            });
        }
    }



    function addToStack(item: string, inStack: string[]): string[] {
        return [item].concat(inStack.length >= STACK_LENGTH ? inStack.slice(0, inStack.length - 1) : inStack);
    }

    function checkClipboardPolling1sec(clipboard: Electron.Clipboard, onChangeCallback: Function) {
        let cache = ""; // clipboard.readText();

        // timerClipboardPolling = setInterval(checkClipboard(clipboard, onChangeCallback) , 1000);
        // timerClipboardPolling = setInterval(checkClipboard , 1000);
        setInterval(checkClipboard, 1000);

        // function checkClipboard(clipboard: Electron.Clipboard, onChangeCallback: Function) {
        function checkClipboard() {
            let latest = clipboard.readText();
            if (cache !== latest) {
                cache = latest;
                onChangeCallback(cache);
            }

        }
    }
}

function addTray() {
    appTray = new Tray(__dirname + "\\..\\assets\\trayIcon.jpg");
    appTray.setToolTip("Clipboard history");

};

function addTrayMenu(stack: string[]) {
    const MENU_ITEM_MAC_LENGTH = 20;

    const trayMenuTemplateInit: Electron.MenuItemOptions[] =
        [
            {
                type: "separator"
            }
            , {
                label: "Create webView",
                click: () => {
                    // const win = webview.screenConstructor("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
                    // windows.push(win);
                }
            }
            , {
                label: "Youtube download",
                click: () => {
                    const ytdWin = ytDownload.screenConstructor(app);
                    windows.push(ytdWin);
                }
            }
            , {
                label: "Ping",
                click: () => {
                    // const win = webview.screenConstructor("https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
                    // windows.push(win);
                    // ipcMain.emit("test", "texte");
                    // win.webContents.send("navigate-to", "https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
                    win.webContents.send(evtDef.WEBVIEW_NAVIGATE_TO, "https://app.pluralsight.com/library/courses/electron-fundamentals/table-of-contents");
                }
            }
            , {
                label: "Quit",
                click: _ => { app.quit(); }
            }
        ];
    const trayMenuTemplate = createMenuTemplate(stack).concat(trayMenuTemplateInit);

    const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setContextMenu(trayMenu);

    function createMenuTemplate(inStack: string[]): Electron.MenuItemOptions[] {
        const menuIfEmptyStack: Electron.MenuItemOptions[] = [
            {
                label: "<empty>",
                enabled: false
            }
        ];
        let menuTemplate: Electron.MenuItemOptions[] = [];

        if (inStack.length === 0) {
            menuTemplate = menuIfEmptyStack;
        } else {
            menuTemplate = inStack.map(createMenuItemTemplate);
        }

        return menuTemplate;

        function createMenuItemTemplate(stackItem: string, index: number) {
            let menuItemTemplate: Electron.MenuItemOptions;

            menuItemTemplate = {
                label: `${index} - ${formatMenuItem(stackItem)}`,
                click: _ => { clipboard.writeText(stackItem); }
            };

            return menuItemTemplate;
        }
    }

    function formatMenuItem(stackItem: string): string {
        return stackItem.length >= MENU_ITEM_MAC_LENGTH ? stackItem.slice(0, MENU_ITEM_MAC_LENGTH) + "..." : stackItem;
    }
};


