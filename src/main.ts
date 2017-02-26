import { app, Menu, ipcMain, Tray, BrowserWindow, clipboard, globalShortcut } from "electron";
import * as screenCapture from "./screenCapture.constructor";
import * as evtDef from "./eventDef";
import * as path from "path";

let windows: Electron.BrowserWindow[] = [];
let appTray: Electron.Tray;
let timerClipboardPolling: number;

app.on("ready", _ => {

    windows.push(screenCapture.screenConstructor(app));
    globalShortcut.register("Ctrl+Alt+1", _ => {
        // console.log("in register shortcut!");
        // ipcMain.emit(evtDef.SCREENCAPTURE_CLICKED);
        windows[0].webContents.send(evtDef.SCREENCAPTURE_CLICKED, path.join(__dirname, "screenshots") );
    });

    addClipboardManager();
});

app.on("will-quit", _ => {
    globalShortcut.unregisterAll();
    windows.forEach(win => win = null);
    appTray.destroy();
});

ipcMain.on(evtDef.MAIN_CONSOLE_LOG, (evt, message)  => {
    console.log(message);
});

function addClipboardManager() {
    const STACK_LENGTH = 10;
    const MENU_ITEM_MAC_LENGTH = 20;
    let stack: string[] = [];

    addTray();
    checkClipboardPolling1sec(clipboard, clipboardChanged);

    function clipboardChanged(text: string) {
        stack = addToStack(text, stack);
        addTrayMenu(stack);
        // registerShortcuts(globalShortcut, clipboard, stack);
    }

    function registerShortcuts(inGlobalShortcut: Electron.GlobalShortcut, inClipboard: Electron.Clipboard, stack: string[]) {
        inGlobalShortcut.unregisterAll();
        stack.forEach(registerShortcut);

        function registerShortcut(stackItem: string, index: number) {
            inGlobalShortcut.register(`Ctrl+Alt+${index}`, _ => {
                inClipboard.writeText(stackItem);
            });
        }
    }

    function addTray() {
        appTray = new Tray(__dirname + "\\..\\assets\\trayIcon.jpg");
        appTray.setToolTip("Clipboard history");
    };

    function addTrayMenu(stack: string[]) {
        const trayMenuTemplateInit: Electron.MenuItemOptions[] =
            [
                {
                    type: "separator"
                },
                {
                    label: "Quit",
                    click: _ => { app.quit(); }
                }
            ];
        const trayMenuTemplate = createMenuTemplate(stack).concat(trayMenuTemplateInit);

        const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
        appTray.setContextMenu(trayMenu);
    }

    function createMenuTemplate(stack: string[]): Electron.MenuItemOptions[] {
        const menuIfEmptyStack: Electron.MenuItemOptions[] = [
            {
                label: "<empty>",
                enabled: false
            }
        ];
        let menuTemplate: Electron.MenuItemOptions[] = [];

        if (stack.length === 0) {
            menuTemplate = menuIfEmptyStack;
        } else {
            menuTemplate = stack.map(createMenuItemTemplate);
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

    function addToStack(item: string, stack: string[]): string[] {
        return [item].concat(stack.length >= STACK_LENGTH ? stack.slice(0, stack.length - 1) : stack);
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

