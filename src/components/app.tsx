import { h, Component } from 'preact';

import { Terminal } from './terminal';
import { Tabs } from './Tabs';

import type { ITerminalOptions, ITheme } from '@xterm/xterm';
import type { ClientOptions, FlowControl } from './terminal/xterm';

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const path = window.location.pathname.replace(/[/]+$/, '');
const wsUrl = [protocol, '//', window.location.host, path, '/ws', window.location.search].join('');
const tokenUrl = [window.location.protocol, '//', window.location.host, path, '/token'].join('');
const clientOptions = {
    rendererType: 'webgl',
    disableLeaveAlert: false,
    disableResizeOverlay: false,
    enableZmodem: false,
    enableTrzsz: false,
    enableSixel: false,
    closeOnDisconnect: false,
    isWindows: false,
    unicodeVersion: '11',
} as ClientOptions;
const termOptions = {
    fontSize: 13,
    fontFamily: 'Consolas,Liberation Mono,Menlo,Courier,monospace',
    theme: {
        foreground: '#d2d2d2',
        background: '#2b2b2b',
        cursor: '#adadad',
        black: '#000000',
        red: '#d81e00',
        green: '#5ea702',
        yellow: '#cfae00',
        blue: '#427ab3',
        magenta: '#89658e',
        cyan: '#00a7aa',
        white: '#dbded8',
        brightBlack: '#686a66',
        brightRed: '#f54235',
        brightGreen: '#99e343',
        brightYellow: '#fdeb61',
        brightBlue: '#84b0d8',
        brightMagenta: '#bc94b7',
        brightCyan: '#37e6e8',
        brightWhite: '#f1f1f0',
    } as ITheme,
    allowProposedApi: true,
} as ITerminalOptions;
const flowControl = {
    limit: 100000,
    highWater: 10,
    lowWater: 4,
} as FlowControl;

interface Tab {
    id: number;
    title: string;
}

interface State {
    terminals: { id: number; title: string }[];
    activeTabId: number;
    nextTabId: number;
}

export class App extends Component<{}, State> {
    constructor() {
        super();
        this.state = {
            terminals: [{ id: 1, title: '~' }],
            activeTabId: 1,
            nextTabId: 2,
        };
    }

    handleTabClick = (id: number) => {
        this.setState({ activeTabId: id });
    };

    handleNewTab = () => {
        const { terminals, nextTabId } = this.state;
        this.setState({
            terminals: [...terminals, { id: nextTabId, title: '~' }],
            activeTabId: nextTabId,
            nextTabId: nextTabId + 1,
        });
    };

    handleCloseTab = (id: number) => {
        const { terminals, activeTabId } = this.state;
        if (terminals.length === 1) return;

        const newTerminals = terminals.filter(t => t.id !== id);
        const newActiveId = activeTabId === id ? newTerminals[newTerminals.length - 1].id : activeTabId;

        this.setState({
            terminals: newTerminals,
            activeTabId: newActiveId,
        });
    };

    handleDirectoryChange = (tabId: number) => (directory: string) => {
        this.setState({
            terminals: this.state.terminals.map(t =>
                t.id === tabId ? { ...t, title: directory } : t
            ),
        });
    };

    render({}, { terminals, activeTabId }: State) {
        return (
            <div style="height: 100%">
                <Tabs
                    tabs={terminals}
                    activeTabId={activeTabId}
                    onTabClick={this.handleTabClick}
                    onNewTab={this.handleNewTab}
                    onCloseTab={this.handleCloseTab}
                />
                {terminals.map(tab => (
                    <div
                        key={tab.id}
                        class={tab.id === activeTabId ? 'terminal-visible' : 'terminal-hidden'}
                    >
                        <Terminal
                            id={`terminal-container-${tab.id}`}
                            wsUrl={wsUrl}
                            tokenUrl={tokenUrl}
                            clientOptions={clientOptions}
                            termOptions={termOptions}
                            flowControl={flowControl}
                            onDirectoryChange={this.handleDirectoryChange(tab.id)}
                        />
                    </div>
                ))}
            </div>
        );
    }
}