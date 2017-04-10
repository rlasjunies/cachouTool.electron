import { ipcRenderer, desktopCapturer, screen, remote } from "electron";
import * as evtDef from "../share/eventDef";
import * as lpr from "../share/helper.renderer";
import * as $ from "jquery";
import { downloadFile } from "../share/downloadFile";
import * as path from "path";
import { fileNameSafer, jsonFileSave, jsonFileRead } from "../share/fs.helper";
import { ensureDirSync } from "fs-extra";
import * as fs from "fs";


let meltHistoryList: HTMLDivElement;
let mIDList: string[] = [];
const mDownloadFolderRoot: string = "D:\\temp\\downloadYTMP3";
const mAPIKey = "7eb63217014083fbef22a95255135046";

interface IYTMP3Data {
    artist: string;
    average_rating: number;
    bitrate: number;
    categories: string;
    expires_in: number;
    id: string;
    length: number;
    progress: number;
    ready: number;
    status: "ok" | "error" | "timeout";
    thumbnail: string;
    title: string;
    url: string;
    video_url: string;
    view_count: number;
    // TODO: check if that correct
    message: string;
}
interface ICheckYTMp3Answer {
    videoid: string;
    error: Error;
    timeOut: boolean;
    data: IYTMP3Data;
}

// Event listening registration
const MEVT_SONG_READY_FOR_DOWNLOAD = "SONG_READY_FOR_DOWNLOAD";
const MEVT_SONG_DOWNLOADING = "SONG_DOWNLOADING";
const MEVT_SONG_ADDED = "SONG_ADDED_EXISTING";
const MEVT_SONG_DOWNLOADED = "SONG_DOWNLOADED";
const MEVT_SONG_PLAYING = "MEVT_SONG_PLAYING";
const MEVT_SONG_STOPPED = "MEVT_SONG_STOPPED";
const MEVT_SONG_PAUSED = "MEVT_SONG_PAUSED";

ipcRenderer.addListener(evtDef.YOUTUBE_NAVIGATE, addUrlInHistory);
ipcRenderer.on(MEVT_SONG_READY_FOR_DOWNLOAD, (event) => {
    let value = (<IYTMP3Data>(<any>event));
    // lpr.consoleLogMain(event);
    // lpr.consoleLogMain(value);
    $(`#download${value.id}`).css({ "display": "flex" });
    $(`#play${value.id}`).css({ "display": "none" });
    $(`#pause${value.id}`).css({ "display": "none" });
    $(`#stop${value.id}`).css({ "display": "none" });
});
ipcRenderer.addListener(MEVT_SONG_DOWNLOADING, (event) => {
    let value = (<IYTMP3Data>(<any>event));
    $(`#download${value.id}`).css({ "display": "none" });
    $(`#play${value.id}`).css({ "display": "none" });
    $(`#pause${value.id}`).css({ "display": "none" });
    $(`#stop${value.id}`).css({ "display": "none" });
});
ipcRenderer.addListener(MEVT_SONG_DOWNLOADED, (event) => {
    let value = (<IYTMP3Data>(<any>event));
    $(`#progress${value.id}`).hide();
    $(`#download${value.id}`).css({ display: "none" });
    $(`#play${value.id}`).css({ display: "flex" });
    $(`#pause${value.id}`).css({ display: "none" });
    $(`#stop${value.id}`).css({ display: "none" });
});
ipcRenderer.addListener(MEVT_SONG_PLAYING, (event) => {
    let value = (<IYTMP3Data>(<any>event));
    $(`#download${value.id}`).css({ display: "none" });
    $(`#play${value.id}`).css({ display: "none" });
    $(`#pause${value.id}`).css({ display: "flex" });
    $(`#stop${value.id}`).css({ display: "flex" });
});
ipcRenderer.addListener(MEVT_SONG_PAUSED, (event) => {
    ipcRenderer.emit(MEVT_SONG_DOWNLOADED, event);
});
ipcRenderer.addListener(MEVT_SONG_STOPPED, (event) => {
    ipcRenderer.emit(MEVT_SONG_DOWNLOADED, event);
});



onload = (evt: Event) => {
    mIDList = loadIDsFromFolder();
    // lpr.consoleLogMain(mIDList);
};

function loadIDsFromFolder(): string[] {
    try {
        const filesName = fs.readdirSync(mDownloadFolderRoot);
        return filesName.map((fileName: string) => {
            if ((/\.(json)$/i).test(fileName)) {
                return fileName.replace(".json", "");
            } else {
                return null;
            }
        })
            .filter((fileName: string | null) => {
                return !(fileName === null);
            });
    }
    catch (err) {
        throw err;
    }
}


function addUrlInHistory(evt, url: string) {
    let videoId = getVideoId(url);
    if (videoId !== "") {

        if (isItNewAddItIfNot(videoId)) {
            checkYTMp3IfCanDownloadAndRetries(videoId, mAPIKey);
        }
    }
}

function checkYTMp3IfCanDownloadAndRetries(videoId: string, APIKey: string) {
    checkYTMp3IfCanDownload(videoId, mAPIKey)
        .then((YTMP3answer) => {
            if (YTMP3answer.timeOut) {
                lpr.consoleLogMain(`plan retry:${videoId}`);
                // TODO: improve as it's currently infinite loop
                setTimeout(checkYTMp3IfCanDownload(videoId, APIKey), 1000);
            }
        });
}

function isItNewAddItIfNot(videoId: string): boolean {

    if ($.inArray(videoId, mIDList) === -1) {
        // not found in the array
        mIDList.push(videoId);
        return true;
    } else {
        return false;
    }
}

function clickOnItem(url: string) {
    return (evtClick: Event) => {
        lpr.consoleLogMain(`Clicked url:${url}`);
        ipcRenderer.send(evtDef.HISTORY_CLICKED, url);
    };
};

/**
 * check if yt-mp3 can convert the video to mp3
 * it return a structure
 * //TODO: retries may need to be added
 * @param {string} id
 * @param {string} key
 * @returns
 */
function checkYTMp3IfCanDownload(id: string, key: string) {
    return $.getJSON("http://www.yt-mp3.com/fetch?v=" + id + "&apikey=" + key)
        .then(checkYTMp3IfCanDownloadParseAnswer)
        .then((answer: ICheckYTMp3Answer) => {
            // add videoid to the message
            answer.videoid = id;
            return answer;
        })
        .then(logErrorIfAny)
        .then(createDownloadTileIfReady);
}

function checkYTMp3IfCanDownloadParseAnswer(yt_data: IYTMP3Data, status: string, jqHXR: JQueryXHR): ICheckYTMp3Answer {
    let answer: ICheckYTMp3Answer = {
        videoid: "",
        timeOut: false,
        error: null,
        data: null
    };

    if (yt_data.status === "error") {
        answer.error = new Error(yt_data.message);
    } else if (yt_data.status === "timeout") {
        answer.timeOut = true;
    } else {
        answer.data = yt_data;
        // remove artist name and ' -' before the title of song
        answer.data.title = answer.data.title.slice(answer.data.artist.length + 2).trim();
    }
    return answer;
};

function createDownloadTileIfReady(answer: ICheckYTMp3Answer): ICheckYTMp3Answer {

    if (answer.data.url !== "") {
        answer.data.artist = answer.data.artist.trim();
        answer.data.title = answer.data.title.trim();
        answer.data.url = "http:" + answer.data.url;
        // lpr.consoleLogMain(`Ready to be download:${answer.data.url}`);
        $("#historyList").append(createSongTile(answer.data));
        ipcRenderer.emit(MEVT_SONG_READY_FOR_DOWNLOAD, answer.data);
    }

    return answer;
}

function createSongTile(songData: IYTMP3Data): JQuery {
    const tileTmpl = `
        <div class="songItem"
            title="${songData.title}">
                <div class="songContent">
                    <img 
                        id="img${songData.id}"
                        src="${songData.thumbnail}"
                        class = "songImg" 
                    >
                    <div class="songDescription">
                        <div class="songTitle">${songData.title}</div>
                        <div class="songArtist">${songData.artist}</div>
                        <div class="songActions" id="action${songData.id}">
                        <button class="songDownload" id="download${songData.id}">Download</button>
                        <button class="songPlay" id="play${songData.id}">Play</button>
                        <button class="songStop" id="stop${songData.id}">Stop</button>
                        <button class="songPause" id="pause${songData.id}">Pause</button>
                        </div>
                    </div>
                </div>
                <div class="songProgress" id="progress${songData.id}"></div>
        </div>`;

    const tileElt = $(tileTmpl)
        .on("click", `#img${songData.id}`, clickOnItem(songData.url))
        .on("click", `#download${songData.id}`, () => {
            downloadSong(songData);
            ipcRenderer.emit(MEVT_SONG_DOWNLOADING, songData);
        })
        .on("click", `#play${songData.id}`, () => {
            playSong(songData);
            ipcRenderer.emit(MEVT_SONG_PLAYING, songData);
        })
        .on("click", `#pause${songData.id}`, () => {
            pauseSong(songData);
            ipcRenderer.emit(MEVT_SONG_PAUSED, songData);
        })
        .on("click", `#stop${songData.id}`, () => {
            stopSong(songData);
            ipcRenderer.emit(MEVT_SONG_STOPPED, songData);
        });
    ipcRenderer.emit(MEVT_SONG_READY_FOR_DOWNLOAD, songData);
    return tileElt;
}

function playSong(song: IYTMP3Data) {

}
function pauseSong(song: IYTMP3Data) {

}
function stopSong(song: IYTMP3Data) {

}

/**
 * download audio, thumbnail and json propterty file
 *
 * @param {IYTMP3Data} songData
 */
function downloadSong(songData: IYTMP3Data) {
    // const folderName = path.join(mDownloadFolderRoot, fileNameSafer(artist), fileNameSafer(id));
    const folderName = path.join(mDownloadFolderRoot);
    ensureDirSync(folderName);

    const fileNameAudio = path.join(folderName, fileNameSafer(songData.id) + ".mp3");
    downloadFile({
        localFile: fileNameAudio,
        remoteFile: songData.url,
        onStart: progressStart(songData.id),
        onProgress: progressing(songData.id),
        onDone: progressDone(songData.id)
    });

    const fileNameThumbnail = path.join(folderName, fileNameSafer(songData.id) + ".png");
    downloadFile({
        localFile: fileNameThumbnail,
        remoteFile: songData.thumbnail,
        onStart: null,
        onProgress: null,
        onDone: null
    });

    const fileNameProperties = path.join(folderName, fileNameSafer(songData.id) + ".json");
    jsonFileSave(fileNameProperties, songData);

}

function progressStart(id: string) {
    return () => {
        $(`#progress${id}`)
            .css({
                "width": "0%",
                "visibility": "visible"
            });
    };
}

function progressDone(id: string) {
    return () => {
        ipcRenderer.emit(MEVT_SONG_DOWNLOADED, {id: id});
    };
}

function progressing(id: string) {
    return (received: number, total: number) => {
        let percentage = Math.floor((received * 100) / total);
        $(`#progress${id}`)
            .css({
                "width": "" + percentage + "%",
                "transition": "0.2s",
                "visibility": "visible"
            });
    };
}

function logErrorIfAny(answer: ICheckYTMp3Answer): ICheckYTMp3Answer {
    if (answer.error) {
        lpr.consoleLogMain(`Error check yt-mp3:${answer.error.message}`);
    }

    if (answer.timeOut) {
        lpr.consoleLogMain(`Error yt-mp3 timeouted!!`);
    }

    return answer;
}

function getVideoId(insUrl: string): string {
    // let urlParsed = insUrl.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    // let videoid = urlParsed[1];
    let urlParsed = insUrl.match(/((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?/);
    // lpr.consoleLogMain(`urlParsed:${urlParsed}`);
    if (urlParsed == null) {
        return "";

    } else {
        return urlParsed[5];
    }
};