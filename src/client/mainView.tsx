import * as React from 'react';
import { Subscription, Subject } from 'rxjs';

interface ILogEntry {
    parts?: any[]
}
interface IMainViewState {
    entries: ILogEntry[];
}

export class MainView extends React.Component<{}, IMainViewState> {

    static log$ = new Subject<ILogEntry>();
    logsub: Subscription;

    constructor() {
        super();
        this.state = { entries: [] };
    }

    componentDidMount() {
        this.logsub = MainView.log$.subscribe(
            entry => {
                if (entry) {
                    this.state = { entries: [...this.state.entries, entry] };
                } else {
                    this.state = { entries: [] };
                }
                this.setState(this.state);
            }
        )
    }

    static log(message?: any, ...optionalParams: any[]) {
        const entry: ILogEntry = {
            parts: [message, ...optionalParams]
        };
        this.log$.next(entry);
        console.info(message, ...optionalParams);
    }

    static clearLog() {
        this.log$.next(null);
    }

    static makeString(thing: any): string {
        if (typeof thing === 'string') {
            return thing;
        }
        if (typeof thing === 'number') {
            return `${thing}`;
        }
        return JSON.stringify(thing);
    }

    content(): JSX.Element[] {
        let elements: JSX.Element[] = [];
        this.state.entries.forEach((entry) => {
            const parts: string[] = [];
            entry.parts.forEach(part => {
                parts.push(MainView.makeString(part));
            });
            const message = parts.join(' ');
            elements.push(<div dangerouslySetInnerHTML={{__html: `<div>${message}</div>`}}/>);
        });
        return elements;
    }

    render() {
        return (
            <div>
                <h1>Electron test</h1>
                <div>
                    {this.content()}
                </div>
            </div>
        );
    }
}
