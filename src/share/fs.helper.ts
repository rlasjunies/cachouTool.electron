import * as fs from "fs";

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