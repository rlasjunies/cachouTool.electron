import { ipcRenderer, desktopCapturer, screen, remote } from "electron";
import * as evtDef from "../share/eventDef";
import * as path from "path";
import * as fs from "fs";
import * as $ from "jquery";
import * as lpr from "../share/helper.renderer";

import { consoleLogMain } from "../share/helper.renderer";
// import * as srv from "./youtubeDownload.service";

// const request = require("request");
import * as request from "request";

// const cheerio = require("cheerio");
import * as cheerio from "cheerio";

let eltUrl: HTMLInputElement;
let eltResults: HTMLInputElement;
let eltKey: HTMLInputElement;
let eltAudio: HTMLAudioElement;
let eltDownload: HTMLButtonElement;
let eltTitleToPlay: HTMLInputElement;
let eltPlay: HTMLButtonElement;

lpr.consoleLogMain("youtubeDownload.renderer loaded!");

onload = (evt: Event) => {

    eltUrl = (<HTMLInputElement>document.getElementById("url"));
    eltResults = (<HTMLInputElement>document.getElementById("results"));
    eltKey = (<HTMLInputElement>document.getElementById("key"));
    eltAudio = (<HTMLAudioElement>document.getElementById("audio"));
    eltTitleToPlay = (<HTMLInputElement>document.getElementById("titleToPlay"));
    eltPlay = (<HTMLButtonElement>document.getElementById("play"));


    eltUrl.onkeypress = (event: KeyboardEvent) => {
        if (event.keyCode === 13) {
            let url = eltUrl.value;
            url = eltUrl.value;
            validateUrl(url);
        }
    };

    eltUrl.onpaste = (event: ClipboardEvent) => {
        let url = eltUrl.value;
        url = eltUrl.value;
        validateUrl(url);
    };

    eltPlay.onclick = (event: MouseEvent) => {
        eltAudio.src = "file://" + eltTitleToPlay.value;
        eltAudio.play();
    };

    lpr.consoleLogMain("youtubeDownload.renderer onLoad!");
    let key = eltKey.value;
    testKey();

    // TODO: is needed?
    // if ($("#results:empty").length) { alert("Error"); }

    eltUrl.focus();
    let url = eltUrl.value;
    validateUrl(url);
};

// function runScript_paste(insUrl: string) {
//     validateUrl(insUrl);
// }

function validateUrl(insUrl: string) {
    let urlParsed = insUrl.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    let videoid = urlParsed[1];
    if (videoid != null) {
        ajax_get_json(videoid, eltKey.value);
    } else {
        // $("input").css("background-color", "rgba(200,20,0,0.3)");
        eltUrl.style.backgroundColor = "rgba(200,20,0,0.3)";
    }
}

function testKey() {
    getapikey();
    setTimeout(function () {
        let apikey = eltKey.value;
        lpr.consoleLogMain(`apiKey dans testKey:${apikey}`);
    }, 2000);

}

function ajax_get_json(id: string, key: string) {
    let yt = id;

    $.getJSON("http://www.yt-mp3.com/fetch?v=" + id + "&apikey=" + key, function (yt_data) {
        if (yt_data.status === "error") {
            eltResults.innerHTML = "<p style='top: 40vh;' id='Down' >" + yt_data.message + "</p>";
            return false;
            // return { error: 998, message: yt_data.message };
        }
        // if(yt_data.status!=='ok'){ajax_get_json(id);}
        if (yt_data.status === "timeout") {
            eltResults.innerHTML = "<p style='top: 40vh;' id='Down' >Video is in a queue, please wait  <img style='line-hight:20px;' src='img/loader.gif' width='13px' height='13px' /></p>";
            setTimeout(function () {
                ajax_get_json(id, key);
            }, 5000);
        } else {
            // eltResults.innerHTML = "";
            try {

                if (yt_data.url !== undefined) {
                    eltResults.innerHTML = "<p id='Down'>" + yt_data.title + "<br><br> <a  href=http:" + yt_data.url + "> Download </a> <br> </p>";
                    // $("#results").css("background-image", "url(" + yt_data.thumbnail + ")");
                    downloadReady();
                } else {
                    $("#results").css("background-image", "url(" + yt_data.thumbnail + ")");
                    eltResults.innerHTML = "<p style='top: 40vh;' id='Down' >Video is in a queue, please wait  <img style='line-hight:20px;' src='img/loader.gif' width='13px' height='50px' /></p>";

                    setTimeout(function () {
                        ajax_get_json(id, key);
                    }, 5000);
                }
            } catch (e) {
                alert("Error, Please restart the application");
                return { error: 999, message: "Error, Please restart the application" };
            }
        }
    });
}

function downloadReady() {
    let window = remote.getCurrentWindow();
    eltDownload = (<HTMLButtonElement>document.getElementById("Down"));
    try {
        eltDownload.onclick = (evt: MouseEvent) => {
            window.webContents.session.on("will-download", (event, item, webContents) => {
                    let fullName = item.getSavePath();
                item.on("updated", (e, state) => {

                    if (state === "interrupted") {
                        item.cancel();
                    } else if (state === "progressing") {
                        if (item.isPaused()) {
                            item.cancel();
                        } else {

                            let percentage = `${Math.floor((item.getReceivedBytes() / item.getTotalBytes()) * 100)}`;
                            $("#loader").css({ "width": "" + percentage + "%", "transition": "0.2s", "background-color": "rgba(155, 89, 182,0.5)" });
                            $("#loader").text(percentage);

                        }
                    }
                });
                item.once("done", (e, state) => {
                    if (state === "completed") {

                        $("#loader").css("background-color", "rgba(26, 188, 156,0.5)");
                        eltAudio.src = fullName;
                        eltAudio.play();

                        setTimeout(function () { $("#loader").css({ "background-color": "rgba(0, 0, 0,0)", "transition": "1s" }); }, 2000);

                    } else {
                        item.cancel();
                    }
                });
            });
        };
    }
    catch (err) {
        alert("Error, Please restart the application");
    }
}

/**
 * This function seems using yt-mp3.com to collect an apikey to later convert yt video in mp3
 * this parse a html page and retrieve a key
 */
function getapikey() {
    // const express = require("express");
    let n, str, apikey, title, a, b, result;

    request("http://www.yt-mp3.com/watch?v=bGPfy2TFvZI", parseScriptTagsToFoundApiKey);
}

function parseScriptTagsToFoundApiKey(error: Error, response: request.RequestResponse, html: any) {
    if (!error && response.statusCode === 200) {
        let $ = cheerio.load(html);
        $("script").each(parseScriptTagToFoundApiKey);
    }
}

/**
 * retrieve the value of the apikey
 *
 * TODO: cette fonction est un peu pourrie il faut s'attendre à la refactoriser
 *
 * @param element
 */
function parseScriptTagToFoundApiKey(i: number, element: CheerioElement) {
    // a = $(this);
    // title = a.text();
    let title = (<HTMLScriptElement>(<any>element)).title;
    let str = title.replace(/['"]+/g, ``);
    let n = str.search("apikey");
    // if (n === -1 || n === 1 || n === 0 || n === false) { }
    if (n === -1 || n === 1 || n === 0) { }
    else {
        let b = str.substr(n + 7);
        let apikey = b.slice(0, b.indexOf("}"));
        eltKey.value = apikey;
    }
}

