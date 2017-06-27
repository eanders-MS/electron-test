import { autoUpdater } from 'electron';
import * as os from "os";
import * as logger from './logger';
var pjson = require('../../package.json');

export interface ICheckForUpdateOptions {
    allowPrerelease?: boolean
}

export function init() {
    autoUpdater.addListener("update-available", (event: Event) => {
        logger.log("Squirrel: A new version is available. Downloading it now. You will be notified when download completes.");
    })
    autoUpdater.addListener("update-downloaded", (event: Event, releaseNotes: string, releaseName: string, releaseDate: Date, updateURL: string) => {
        logger.log("Squirrel: Download complete.");
    })
    autoUpdater.addListener("error", (error: Error) => {
        logger.log("Squirrel: error: " + error.message)
    })
    autoUpdater.addListener("checking-for-update", (event: Event) => {
        logger.log("Squirrel: Checking for new version...");
    })
    autoUpdater.addListener("update-not-available", (event: Event) => {
        logger.log("Squirrel: Application is up to date.");
    })
}

export function checkForUpdates(options: ICheckForUpdateOptions = {}) {
    options = Object.assign({}, {
        allowPrerelease: false
    }, options);
    if (options.allowPrerelease) {
        autoUpdater.setFeedURL(`https://electron-test-nuts/update/channel/rc/${os.platform()}/${pjson.version}`);
    } else {
        autoUpdater.setFeedURL(`https://electron-test-nuts/update/${os.platform()}/${pjson.version}`);
    }
    logger.log('options', options);
    autoUpdater.checkForUpdates();
}
