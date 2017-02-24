import * as electron from "electron";

const app = electron.app;

app.on("ready", _ => {
    console.log("electron is ready");

    new electron.BrowserWindow({
    })
})