import * as Electron from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as NsisUpdater from './updater-nsis';
import * as SquirrelUpdater from './updater-squirrel';
import * as logger from './logger';
var pjson = require('../../package.json') as any;

export var mainWindow: Electron.BrowserWindow;


let template: Electron.MenuItemConstructorOptions[] = []
{
    const name = pjson.name;
    template.push({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                label: 'Clear Log',
                click() { logger.clear(); }
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() { Electron.app.quit(); }
            }
        ]
    });
    template.push({
        label: "NSIS",
        submenu: [
            {
                label: 'Check for update',
                click() { NsisUpdater.checkForUpdates(); }
            },
            {
                label: 'Check for pre-release update',
                click() { NsisUpdater.checkForUpdates({ allowPrerelease: true }); }
            },
            {
                label: 'Download update',
                click() { NsisUpdater.checkForUpdates({ autoDownload: true }); }
            },
            {
                label: 'Download pre-release update',
                click() { NsisUpdater.checkForUpdates({ allowPrerelease: true, autoDownload: true }); }
            },
            {
                label: 'Quit and install',
                click() { NsisUpdater.quitAndInstall(); }
            }
        ]
    });
    template.push({
        label: "Squirrel",
        submenu: [
            {
                label: 'Check for update',
                click() { SquirrelUpdater.checkForUpdates(); }
            },
            {
                label: 'Check for pre-release update',
                click() { SquirrelUpdater.checkForUpdates({ allowPrerelease: true }); }
            },
            {
                label: 'Quit and install',
                click() { SquirrelUpdater.quitAndInstall(); }
            }
        ]
    });
}


const handleRedirect = (e: Event, ...args: any[]) => {
    //if (url != mainWindow.webContents.getURL()) {
        e.preventDefault()
        //require('electron').shell.openExternal(url)
    //}
}


const createMainWindow = () => {
    if (SquirrelUpdater.handleStartupEvent()) {
        return;
    }

    const window = mainWindow = new Electron.BrowserWindow({
        show: false,
        title: `${pjson.name} - ${pjson.version}`
    });

    window.webContents.on('will-navigate', handleRedirect)
    window.webContents.on('new-window', handleRedirect)

    //window.webContents.openDevTools({ mode: 'undocked' });

    window.once('ready-to-show', () => {
        window.show();
        logger.ready();
    });

    const page = url.format({
        protocol: 'file',
        slashes: true,
        pathname: path.join(__dirname, '../client/index.html')
    });

    window.loadURL(page);

    const menu = Electron.Menu.buildFromTemplate(template);
    Electron.Menu.setApplicationMenu(menu);

    NsisUpdater.init();
    SquirrelUpdater.init();

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

Electron.ipcMain.on('checkForUpdate', (args: any) => {
    logger.log('client-envoked checkForUpdate');
});
