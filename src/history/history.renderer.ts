import { ipcRenderer, desktopCapturer, screen, remote } from "electron";
import * as evtDef from "../share/eventDef";
import * as lpr from "../share/helper.renderer";
import * as $ from "jquery";
import { downloadFile } from "./downloadFile";

let eltHistoryList: HTMLDivElement;
let urlList: string[] = [];
// let urlListCheckToDownload: string[] = [];

const mAPIKey = "7eb63217014083fbef22a95255135046";

onload = (evt: Event) => {
    // eltHistoryList = (<HTMLDivElement>document.getElementById("historyList"));
};

// lpr.consoleLogMain("history.renderer loaded!");

ipcRenderer.addListener(evtDef.YOUTUBE_NAVIGATE, addUrlInHistory);

function addUrlInHistory(evt, url: string) {
    let videoId = getVideoId(url);
    // lpr.consoleLogMain(`addUrl:${url}`);
    // lpr.consoleLogMain(`addUrl video id:${videoId}`);
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

    if ($.inArray(videoId, urlList) === -1) {
        // not found in the array
        urlList.push(videoId);
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
        answer.data.title = answer.data.title.slice(answer.data.artist.length + 2);
    }
    return answer;
};

function createDownloadTileIfReady(answer: ICheckYTMp3Answer): ICheckYTMp3Answer {

    if (answer.data.url !== "") {
        // lpr.consoleLogMain(`Ready to be download:${answer.data.url}`);
        $("#historyList")
            .append(createSongTile(
                answer.videoid,
                answer.data.thumbnail,
                answer.data.title,
                answer.data.url,
                answer.data.artist));
    }

    return answer;
}

function createSongTile(id: string, thumbnail: string, title: string, downloadLink: string, artist: string): JQuery {

    const tileTmpl = `
        <div class="songItem"
            title="${title}">
                <img 
                    id="img${id}"
                    src="${thumbnail}"
                    class = "songImg" 
                >
                <div class="songDescription">
                    <div class="songTitle">${title}</div>
                    <div class="songArtist">${artist}</div>
                    <button class="songDownload" id="download${id}">Download</button>
                </div>
        </div>`;

    const tileElt = $(tileTmpl)
        .on("click", `#img${id}`, clickOnItem(downloadLink))
        .on("click", `#download${id}`, () => {
            download("http:" + downloadLink);
        });

    return tileElt;
}

function download(url: string) {
    downloadFile({
        localFile: "d://temp//downloadYTMP3//test.mp3",
        remoteFile: url,
        onProgress: progress
    });
}

function progress(received: number, total: number) {
    let percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
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
    lpr.consoleLogMain(`urlParsed:${urlParsed}`);
    // let videoid = urlParsed[5];
    if (urlParsed == null) {
        return "";
    } else {
        return urlParsed[5];
    }
};