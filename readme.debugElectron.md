

> https://github.com/octref/vscode-electron-debug  
> http://code.matsu.io/1

Here is a guide to debugging Electron App with VSCode. It works on all platforms, and includes instruction for debugging both Main and Renderer process.

I’ll be using electron/electron-quick-start. Clone and open the project in VSCode. Then go to the Debug View and click the configure icon to make an empty launch.json.

You can also skip this tutorial and grab the code at: octref/vscode-electron-debug
Main Process

Fill launch.json with the following.

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron.cmd"
      },
      "program": "${workspaceRoot}/main.js",
      "protocol": "legacy",
    }
  ]
}
```

The setting is pretty self-explanatory, use the electron in node_modules to run main.js. If you go to the Debug View and run Debug Main Process, you should see the code stopping at the breakpoints in main.js.