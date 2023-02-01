const electron = require('electron');
const { app } = electron;
const { BrowserWindow } = electron;
let win;
function createWindow() {
    console.log(`${__dirname}`);
    win = new BrowserWindow({ width: 800, height: 600 });
    win.loadURL(`file:///C:/Source/Git/webgl/GitHub/webgl/webgl/dist/index.html`);
    win.webContents.openDevTools();
    win.on('closed', () => {
        win = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
