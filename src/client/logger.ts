import * as Electron from 'electron';
import { MainView } from './mainView';


export function log(message?: any, ...optionalParams: any[]) {
    MainView.log(message, ...optionalParams);
}

export function init() {
    Electron.ipcRenderer.on('log', (event: Event, ...args: any[]) => {
        log(args[0], ...args.slice(1));
    });
}
