import * as shell from "shelljs";

// shell.config.verbose = true;

// shell.cp("-Ru", "src/**/*.html", "build/**/*.html");
// shell.cp("-Ru", "src/**/*.html", "build/*"); => copy all the files in the last folder
// shell.cp("-Ru", "src/**/*.html", "build/**"); => infinite loop?
// shell.cp("-Ru", "src/**/*.html", "/build/**"); => too many
// shell.cp("-Ru", "src/**/*.html", "/build"); => ???
// shell.cp("-Ru", "src/**/*.html", "build"); => add the files at the root of destination,
// shell.cp("-Ru", "src/**/*.html", "build/"); => add the files at the root of destination
// shell.cp("-Ru", "./src/**/*.html", "./build/**"); => infinite loop
// shell.cp("-Ru", "./src/**/*.html", "./build");

copyRecursiveFiles("./src", "**/*.html", "./build");

function copyRecursiveFiles(sourceFolder: string, glob: string, destFolder: string) {
  // console.log(shell.pwd().stdout);
  shell.pushd(sourceFolder);
  // console.log(shell.pwd().stdout);
  let files = shell.ls(glob);
  shell.popd();
  // console.log(shell.pwd().stdout);

  files.forEach(file => {
    // console.log(`File to copy:${file}`);
    let sourceFile = removeLastSlashIfExist(sourceFolder) + "/" + file;
    let destFile = removeLastSlashIfExist(destFolder) + "/" + file;
    // console.log(`**** Sourcefile: ${sourceFile} destfile:${destFile}`);
    shell.cp(sourceFile, destFile);
  });
}

function removeLastSlashIfExist(folder: string) {
  return folder.replace(/\/$/, "");
}