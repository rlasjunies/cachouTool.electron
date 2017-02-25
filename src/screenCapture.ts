import * as electron from "electron";

const ipc = electron.ipcRenderer;

console.log("in renderer");

document
    .getElementById("start")
    .addEventListener("click",
    _ => {
        // console.log("click on the button");
        ipc.send("countDownStartClicked");
    });

ipc.on("countDown", (evt, count)  => {
    console.log("countDown event received via ipc", count);

    document.getElementById("counter").innerHTML = count;
});