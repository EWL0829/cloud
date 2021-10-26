const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

let mainWindow;
Store.initRenderer();

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 680,
        // Settings of web page's features
        webPreferences: {
            // 在这个主进程内部的渲染进程可以使用Node
            nodeIntegration: true,
            enableRemoteModule: true,
        },
    });

    const urlLocation = isDev ? 'http://localhost:3123' : 'dummy';
    mainWindow.loadURL(urlLocation);
    mainWindow.webContents.openDevTools({
        mode: "detach"
    });
});
app.on('window-all-closed', () => {
    console.log('全关了'); // eslint-disable-line
})
