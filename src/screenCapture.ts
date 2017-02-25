import { app, BrowserWindow, ipcRenderer } from "electron";

export function screenConstructor(app: Electron.App): Electron.BrowserWindow {
    let win = new BrowserWindow({
        width: 0,
        height: 0,
        resizable: false,
        frame: false,
        show: false
    });

    win.loadURL(`file://${__dirname}/screenCapture.html`);
    win.on("closed", _ => {
        console.log("screenCapture windows closed!");
        win = null;
    });


    // document
    //     .getElementById("start")
    //     .addEventListener("click",
    //     _ => {
    //         // console.log("click on the button");
    //         ipcRenderer.send("countDownStartClicked");
    //     });

    // ipcRenderer.on("countDown", (evt, count) => {
    //     console.log("countDown event received via ipc", count);

    //     document.getElementById("counter").innerHTML = count;
    // });

    return win;
}