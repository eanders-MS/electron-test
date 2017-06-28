import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as logger from './logger';

export interface ICheckForUpdateOptions {
    allowPrerelease?: boolean,
    autoDownload?: boolean
}

export function init() {
    if (process.env.NODE_ENV === "development") {
        autoUpdater.updateConfigPath = path.join(process.cwd(), 'dev-app-update.yml');
    }
    autoUpdater.on('checking-for-update', (ev: Event, ...args: any[]) => {
        logger.log('checking for update', ...args);
    });
    autoUpdater.on('update-available', (ev: Event, ...args: any[]) => {
        logger.log('<a href="app://api/checkForUpdate?autoDownload=true">downloadUpdate</a>');
        logger.log('update available: ', ...args);
    });
    autoUpdater.on('update-not-available', (...args: any[]) => {
        logger.log('<a href="app://api/checkForUpdate">checkForUpdate</a>');
        logger.log('update not available: ', ...args);
    });
    autoUpdater.on('error', (ev: Event, err: Error, ...args: any[]) => {
        logger.log('<a href="app://api/checkForUpdate">checkForUpdate</a>');
        logger.log('error: ', `<pre>${err.toString()}</pre>`, ...args);
    });
    autoUpdater.on('download-progress', (ev: Event, ...args: any[]) => {
        logger.log('download progress: ', ...args);
    });
    autoUpdater.on('update-downloaded', (ev: Event, ...args: any[]) => {
        logger.log('update downloaded: ', ...args);
    });
}


export function checkForUpdates(options: ICheckForUpdateOptions = {}) {
    options = Object.assign({}, {
        allowPrerelease: false,
        autoDownload: false
    }, options);
    autoUpdater.allowPrerelease = options.allowPrerelease;
    autoUpdater.autoDownload = options.autoDownload;
    autoUpdater.allowDowngrade = false;
    logger.log('options', options);
    autoUpdater.checkForUpdates();
}

export function quitAndInstall() {
    autoUpdater.quitAndInstall();
}
