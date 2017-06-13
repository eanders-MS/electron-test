import * as Electron from 'electron';
import * as url from 'url';
import * as path from 'path';

export let mainWindow: Electron.BrowserWindow;

const createMainWindow = () => {

    const windowTitle = "Electron Test";

    let window = mainWindow = new Electron.BrowserWindow({ show: false });
    window.setTitle(windowTitle);

    window.webContents.openDevTools({mode: 'undocked'});

    window.once('ready-to-show', () => {
        window.show();
    });

    const page = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../client/index.html')
    });

    window.loadURL(page);
}

Electron.app.on('ready', createMainWindow);
Electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        Electron.app.quit();
    }
});
Electron.app.on('activate', () => {
    if (!mainWindow) {
        createMainWindow();
    }
});
