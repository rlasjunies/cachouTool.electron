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
                return "";
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
        onStart: () => { },
        onProgress: () => { },
        onDone: () => { }
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
        ipcRenderer.emit(MEVT_SONG_DOWNLOADED, { id: id });
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
}