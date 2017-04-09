import * as fs from "fs";
import * as fse from "fs-extra";

// export function createFolderIfNotExistsSync(folderName: string) {
//     if (!fs.existsSync(folderName)) {
//         fs.mkdirSync(folderName);
//     }
// }

/**
 * replace fileName/Folder bad char by _
 *
 * @export
 * @param {string} unsafeFileName
 * @returns {string} safeFileName
 */
export function fileNameSafer(unsafeFileName: string): string {
    return unsafeFileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function jsonFileSave(fileName: string, data: any) {
    try {
        fs.writeFileSync(fileName, JSON.stringify(data), "utf-8");
    } catch (err) {
        throw err;
    }
}

export function jsonFileRead<T>(fileName: string): T {
    try {
        fs.openSync(fileName, "r+");
        let data = fs.readFileSync(fileName);
        return JSON.parse(data.toString());
    } catch (err) {
        console.log("Error creating settings file: " + JSON.stringify(err));
        throw err;
    }
}


