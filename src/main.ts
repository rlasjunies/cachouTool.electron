// import * as electron from "electron";

import { app, Menu, ipcMain, Tray, BrowserWindow } from "electron";

import { countDown } from "./countDown.service";

// const app = electron.app;
// cconst ipc = electron.ipcMain;

let windows: Electron.BrowserWindow[] = [];

app.on("ready", _ => {

    addTray();
    addMenu();
    add3Windows();

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
    [1, 2, 3].forEach(_ => {
        let win = addWindow();
        windows.push(win);
    });
}