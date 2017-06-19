import * as Electron from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as AppUpdater from './updater';
import * as logger from './logger';
var pjson = require('../../package.json') as any;

export var mainWindow: Electron.BrowserWindow;


let template: Electron.MenuItemConstructorOptions[] = []
{
    const name = pjson.name;
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                label: 'Check for update',
                click() { AppUpdater.checkForUpdates(); }
            },
            {
                label: 'Check for pre-release update',
                click() { AppUpdater.checkForUpdates({ allowPrerelease: true }); }
            },
            {
                label: 'Download update',
                click() { AppUpdater.checkForUpdates( { autoDownload: true }); }
            },
            {
                label: 'Download pre-release update',
                click() { AppUpdater.checkForUpdates({ allowPrerelease: true, autoDownload: true }); }
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() { Electron.app.quit(); }
            },
        ]
    })
}


const createMainWindow = () => {

    const window = mainWindow = new Electron.BrowserWindow({
        show: false,
        title: `${pjson.name} - ${pjson.version}`
    });

    window.webContents.openDevTools({ mode: 'undocked' });

    window.once('ready-to-show', () => {
        window.show();
    });

    const page = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../client/index.html')
    });

    window.loadURL(page);

    const menu = Electron.Menu.buildFromTemplate(template);
    Electron.Menu.setApplicationMenu(menu);

    AppUpdater.init();

    logger.log("server ready");
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
