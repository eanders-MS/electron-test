import { mainWindow } from './main';

interface IQueueEntry {
    message?: any;
    optionalParams: any[]
}

let sendQueue: IQueueEntry[] = [];
let windowReady: boolean = false;

export function ready() { windowReady = true; }

export function log(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
    if (mainWindow && mainWindow.webContents && windowReady) {
        sendQueue.forEach(entry => {
            mainWindow.webContents.send(entry.message, ...entry.optionalParams);
        });
        sendQueue = [];
        mainWindow.webContents.send('log', message, ...optionalParams);
    } else {
        sendQueue.push({
            message,
            optionalParams
        });
    }
}
