import { autoUpdater, app } from 'electron';
import * as os from "os";
import * as path from "path";
import { spawn } from "child_process";
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
        autoUpdater.setFeedURL(`https://electron-test-nuts.azurewebsites.net/update/channel/rc/${os.platform()}/${pjson.version}`);
    } else {
        autoUpdater.setFeedURL(`https://electron-test-nuts.azurewebsites.net/update/${os.platform()}/${pjson.version}`);
    }
    logger.log('options', options);
    autoUpdater.checkForUpdates();
}

function run(args: string[], done: Function): void {
    const updateExe = path.resolve(path.dirname(process.execPath), "..", "Update.exe");
    //logger.log(`Spawning ${updateExe} with args ${args}`);
    spawn(updateExe, args, {
        detached: true
    })
    .on("close", done);
}

export function handleStartupEvent(): boolean {
    if (process.platform !== "win32") {
        return false;
    }

    const cmd = process.argv[1];
    //logger.log(`Processing squirrel command ${cmd}`);
    const target = path.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
        //RegistryManager.RegisterProtocolHandler().then(_ => {
            run(['--createShortcut=' + target + ''], app.quit);
        //});
        return true;
    }
    else if (cmd === "--squirrel-uninstall") {
        //RegistryManager.UnregisterProtocolHandler().then(_ => {
            run(['--removeShortcut=' + target + ''], app.quit);
        //});
        return true;
    }
    else if (cmd === "--squirrel-obsolete") {
        app.quit();
        return true;
    }
    else {
        return false;
    }
}

export function quitAndInstall() {
    autoUpdater.quitAndInstall();
}
