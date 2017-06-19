import { mainWindow } from './main';

export function log(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams);
    if (mainWindow) {
        mainWindow.webContents.send('log', message, ...optionalParams);
    }
}
