import * as lprr from "../share/helper.renderer";
import { ipcRenderer } from "electron";
import * as evtDef from "../share/eventDef";

ipcRenderer.on(evtDef.WEBVIEW_NAVIGATE_TO, webViewNagivateTo);

let webView: Electron.WebViewElement = <Electron.WebViewElement>document.getElementById("webview");
webView.addEventListener("did-start-loading", function (e) {
    // webView.openDevTools();
});

function webViewNagivateTo(evt: Electron.IpcRendererEvent, s) {
    console.log("[wv.rendered]", evt.sender.eventNames, s);
    lprr.consoleLogMain(`---------- test:${s}`);

    webView.src = s;
}

onload = () => {
    const webview: Electron.WebViewElement = <Electron.WebViewElement>document.getElementById("webview");
    const indicator: HTMLDivElement = <HTMLDivElement>document.querySelector(".indicator");

    const loadstart = () => {
        indicator.innerText = "loading...";
    };

    const loadstop = () => {
        indicator.innerText = "";
        lprr.consoleLogMain("loadStop");
        console.log("loadStop");
        const urlDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("url");
        urlDiv.innerHTML = `${webview.getURL()}`;
    };

    const eventTracking = (evt: Electron.WebViewElement.Event) => {
        // console.log(`Event:${evt.type}`);
        // h.consoleLogMain(`Event:${evt.type}`);
        // h.consoleLogMain(`Url:${webview.getURL()}`);
        // rendererConsole(`Event:${evt.type}`);
        if (evt.type === "new-window") {
            const evtNW = (<Electron.WebViewElement.NewWindowEvent>evt);
            // lprr.consoleLogMain(`!!!!!!!!!!!! Url:${webview.getURL()}`);
            // lprr.consoleLogMain(`!!!!!!!!!!!! evt.url:${evtNW.url}`);

            ipcRenderer.send(evtDef.WEBVIEW_NEW_WINDOW_REQUESTED, evtNW.url);
            // const protocol = require('url').parse(e.url).protocol
            // if (protocol === 'http:' || protocol === 'https:') {
            //     shell.openExternal(e.url)
            // }
        }
    };

    // webview.addEventListener("did-start-loading", loadstart);
    webview.addEventListener("did-start-loading", eventTracking);
    webview.addEventListener("did-stop-loading", eventTracking);
    webview.addEventListener("did-fail-load", eventTracking);
    webview.addEventListener("did-get-redirect-request", eventTracking);
    webview.addEventListener("dom-ready", eventTracking);
    webview.addEventListener("console-message", eventTracking);
    webview.addEventListener("new-window", eventTracking);
    webview.addEventListener("will-navigate", eventTracking);
    webview.addEventListener("did-navigate", eventTracking);
    webview.addEventListener("media-started-playing", eventTracking);


};


