import * as Electron from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView } from './mainView';
import * as logger from './logger';

logger.init();
ReactDOM.render(<MainView />, document.getElementById('mainview'));
logger.log("client ready");
Electron.ipcRenderer.send('ready');
