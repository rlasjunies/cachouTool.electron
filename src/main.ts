// import * as electron from "electron";

import { app, Menu, ipcMain, Tray, BrowserWindow, clipboard } from "electron";

import { countDown } from "./countDown.service";

// const app = electron.app;
// cconst ipc = electron.ipcMain;

let windows: Electron.BrowserWindow[] = [];
let appTray: Electron.Tray;
// let timerClipboardPolling: NodeJS.Timer;
let timerClipboardPolling: number;

app.on("ready", _ => {

    // addTray(); -> see addClipboardManager
    addMenu();
    add3Windows();
    addClipboardManager();

});

ipcMain.on("countDownStartClicked", _ => {
    console.log("countDownStart clicked");

    countDown(counterValue => {
        // console.log("countDown callback");

        windows.forEach(win => {
            win.webContents.send("countDown", counterValue);
        });
    });
});

function addTray() {
    let tray = new Tray(__dirname + "\\..\\assets\\trayIcon.jpg");
    tray.setToolTip("That a great demo");
    let trayMenuTemplate: Electron.MenuItemOptions[] = [
        {
            label: "About"
        },
        {
            label: "Quit",
            click: _ => { app.quit(); }
        }
    ];
    let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    tray.setContextMenu(trayMenu);
}

function addMenu() {
    let menuTemplate: Electron.MenuItemOptions[] = [
        {
            label: app.getName(),
            click: () => { console.log("menu clicked"); },
            submenu: [
                {
                    label: "sub1",
                    click: _ => {
                        console.log("sub menu clicked");
                    }
                },
                {
                    type: "separator",
                },
                {
                    label: "Quit",
                    click: _ => {
                        app.quit();
                    },
                    accelerator: "Win+Q"
                }
            ]

        }
    ];
    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

function addWindow(): Electron.BrowserWindow {
    let win = new BrowserWindow({});

    win.loadURL(`file://${__dirname}/countDown.html`);
    win.on("closed", _ => {
        console.log("mainWindow closed");
        win = null;
    });

    return win;
}

function add3Windows() {
    // [1, 2, 3].forEach(_ => {
    [1].forEach(_ => {
        let win = addWindow();
        windows.push(win);
    });
}

function addClipboardManager() {
    const STACK_LENGTH = 10;
    let stack: string[] = [];

    addTray();
    checkClipboardPolling1sec(clipboard, clipboardChanged);

    function clipboardChanged(text: string) {
        stack = addToStack(text, stack);
        console.log("stack:", stack);
    }
    function addTray() {
        appTray = new Tray(__dirname + "\\..\\assets\\trayIcon.jpg");
        appTray.setToolTip("Clipboard history");
        let trayMenuTemplate: Electron.MenuItemOptions[] = [
            {
                label: "<empty>",
                enabled: false
            },
            {
                type: "separator"
            },
            {
                label: "Quit",
                click: _ => { app.quit(); }
            }
        ];
        let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
        appTray.setContextMenu(trayMenu);
    }

    function addToStack(item: string, stack: string[]): string[] {
        return [item].concat(stack.length >= STACK_LENGTH ? stack.slice(0, stack.length - 1) : stack);
    }


    function checkClipboardPolling1sec(clipboard: Electron.Clipboard, onChangeCallback: Function) {
        let cache = ""; // clipboard.readText();

        // timerClipboardPolling = setInterval(checkClipboard(clipboard, onChangeCallback) , 1000);
        // timerClipboardPolling = setInterval(checkClipboard , 1000);
        setInterval(checkClipboard , 1000);

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

