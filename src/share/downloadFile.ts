// http://ourcodeworld.com/articles/read/228/how-to-download-a-webfile-with-electron-save-it-and-show-download-progress
// downloadFile({
//     remoteFile: "http://www.planwallpaper.com/static/images/butterfly-wallpaper.jpeg",
//     localFile: "/var/www/downloads/butterfly-wallpaper.jpeg",
//     onProgress: function (received,total){
//         var percentage = (received * 100) / total;
//         console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
//     }
// }).then(function(){
//     alert("File succesfully downloaded");
// });

import * as request from "request";
import * as fs from "fs";

export interface IConfiguration {
    remoteFile: string;
    localFile: string;
    onProgress: (received: number, total: number) => void;
}

export function downloadFile(configuration: IConfiguration) {
    return new Promise((resolve, reject) => {
        // Save variable to know progress
        let received_bytes = 0;
        let total_bytes = 0;

        let req = request({
            method: "GET",
            uri: configuration.remoteFile
        });

        let out = fs.createWriteStream(configuration.localFile);
        req.pipe(out);

        req.on("response", function ( data ) {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(data.headers["content-length" ]);
        });

        // Get progress if callback exists
        if (configuration.hasOwnProperty("onProgress")) {
            req.on("data", function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;

                configuration.onProgress(received_bytes, total_bytes);
            });
        }else {
            req.on("data", function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;
            });
        }

        req.on("end", function() {
            resolve();
        });
    });
}
