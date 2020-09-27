import { ipcRenderer, desktopCapturer, screen, remote } from "electron";
import * as evtDef from "../share/eventDef";
import * as lpr from "../share/helper.renderer";
import * as $ from "jquery";
import { downloadFile } from "../share/downloadFile";
import * as path from "path";
import { fileNameSafer, jsonFileSave, jsonFileRead } from "../share/fs.helper";
import { ensureDirSync } from "fs-extra";
import * as fs from "fs";


interface IFavorite {
    name: string;
    description: string;
    url: string;
}

const favoriteLocalFileName: string = "c:/temp/favorites.json";
let favorites: IFavorite[] = [
    {
        name: "fav1",
        description: "desc fav1",
        url: "http://www.yahoo.fr"
    }
];

// Event listening registration
// const MEVT_SONG_READY_FOR_DOWNLOAD = "SONG_READY_FOR_DOWNLOAD";
// const MEVT_SONG_DOWNLOADING = "SONG_DOWNLOADING";
// const MEVT_SONG_ADDED = "SONG_ADDED_EXISTING";
// const MEVT_SONG_DOWNLOADED = "SONG_DOWNLOADED";

// ipcRenderer.addListener(evtDef.FAVORITES_SHOW, fa);
// ipcRenderer.on(MEVT_SONG_READY_FOR_DOWNLOAD, (event) => {
//     let value = (<IYTMP3Data>(<any>event));
//     // lpr.consoleLogMain(event);
//     // lpr.consoleLogMain(value);
//     $(`#download${value.id}`).css({ "display": "flex" });
//     $(`#play${value.id}`).css({ "display": "none" });
//     $(`#pause${value.id}`).css({ "display": "none" });
//     $(`#stop${value.id}`).css({ "display": "none" });
// });

onload = (evt: Event) => {
    // const favoriteFile = fs.readFileSync(favoriteLocalFileName, "utf-8");
    // favorites = JSON.parse(favoriteFile);
    lpr.consoleLogMain(`onload event, will favorites:${favorites}`);
    const favorites$ = $("#favorites");
    favorites.forEach(fav => {
        favorites$.add(`
            <div class="favorite" id="${fav.name}">
                <div class="favorite-name">${fav.name}</div>
            </div>
        `);
    });
};

function clickOnItem(fav: IFavorite) {
    return (evtClick: Event) => {
        lpr.consoleLogMain(`favorite clicked:${fav.name}`);
        ipcRenderer.send(evtDef.FAVORITES_CLICKED, fav);
    };
}
