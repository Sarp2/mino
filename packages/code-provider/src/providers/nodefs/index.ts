import type {
    CopyFilesInput,
    CopyFilesOutput,
    CreateDirectoryInput,
    CreateDirectoryOutput,
    CreateProjectInput,
    CreateProjectOutput,
    CreateSessionInput,
    CreateSessionOutput,
    CreateTerminalInput,
    CreateTerminalOutput,
    DeleteFilesInput,
    DeleteFilesOutput,
    DownloadFilesInput,
    DownloadFilesOutput,
    GetTaskInput,
    GetTaskOutput,
    GitStatusInput,
    GitStatusOutput,
    InitializeInput,
    InitializeOutput,
    ListFilesInput,
    ListFilesOutput,
    ListProjectsInput,
    ListProjectsOutput,
    PauseProjectInput,
    PauseProjectOutput,
    ReadFileInput,
    ReadFileOutput,
    RenameFileInput,
    RenameFileOutput,
    SetupInput,
    SetupOutput,
    StatFileInput,
    StatFileOutput,
    StopProjectInput,
    StopProjectOutput,
    TerminalBackgroundCommandInput,
    TerminalBackgroundCommandOutput,
    TerminalCommandInput,
    TerminalCommandOutput,
    WatchEvent,
    WatchFilesInput,
    WatchFilesOutput,
    WriteFileInput,
    WriteFileOutput,
} from '../../types';

import {
    Provider,
    ProviderBackgroundCommand,
    ProviderFileWatcher,
    ProviderTask,
    ProviderTerminal,
} from '../../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NodeFsProviderOptions {}

export class NodeFsProvider extends Provider {
    private readonly options: NodeFsProviderOptions;

    constructor(options: NodeFsProviderOptions) {
        super();
        this.options = options;
    }

    async initialize(_input: InitializeInput): Promise<InitializeOutput> {
        return {};
    }

    async writeFile(_input: WriteFileInput): Promise<WriteFileOutput> {
        return {
            success: true,
        };
    }

    async renameFile(_input: RenameFileInput): Promise<RenameFileOutput> {
        return {};
    }

    async statFile(_input: StatFileInput): Promise<StatFileOutput> {
        return {
            type: 'file',
        };
    }

    async deleteFiles(_input: DeleteFilesInput): Promise<DeleteFilesOutput> {
        return {};
    }

    async listFiles(_input: ListFilesInput): Promise<ListFilesOutput> {
        return {
            files: [],
        };
    }

    async readFile(input: ReadFileInput): Promise<ReadFileOutput> {
        return {
            file: {
                path: input.args.path,
                content: '',
                type: 'text',
                toString: () => {
                    return '';
                },
            },
        };
    }

    async downloadFiles(
        _input: DownloadFilesInput,
    ): Promise<DownloadFilesOutput> {
        return {
            url: '',
        };
    }

    async copyFiles(_input: CopyFilesInput): Promise<CopyFilesOutput> {
        return {};
    }

    async createDirectory(
        _input: CreateDirectoryInput,
    ): Promise<CreateDirectoryOutput> {
        return {};
    }

    async watchFiles(_input: WatchFilesInput): Promise<WatchFilesOutput> {
        return {
            watcher: new NodeFsFileWatcher(),
        };
    }

    async createTerminal(
        _input: CreateTerminalInput,
    ): Promise<CreateTerminalOutput> {
        return {
            terminal: new NodeFsTerminal(),
        };
    }

    async getTask(_input: GetTaskInput): Promise<GetTaskOutput> {
        return {
            task: new NodeFsTask(),
        };
    }

    async runCommand(
        _input: TerminalCommandInput,
    ): Promise<TerminalCommandOutput> {
        return {
            output: '',
        };
    }

    async runBackgroundCommand(
        _input: TerminalBackgroundCommandInput,
    ): Promise<TerminalBackgroundCommandOutput> {
        return {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            command: new NodeFsCommand(),
        };
    }

    async gitStatus(_input: GitStatusInput): Promise<GitStatusOutput> {
        return {
            changedFiles: [],
        };
    }

    async setup(_input: SetupInput): Promise<SetupOutput> {
        return {};
    }

    async createSession(
        _input: CreateSessionInput,
    ): Promise<CreateSessionOutput> {
        return {};
    }

    async reload(): Promise<boolean> {
        // TODO: Implement
        return true;
    }

    async reconnect(): Promise<void> {
        // TODO: Implement
    }

    async ping(): Promise<boolean> {
        return true;
    }

    static async createProject(
        input: CreateProjectInput,
    ): Promise<CreateProjectOutput> {
        return {
            id: input.id,
        };
    }

    static async createProjectFromGit(_input: {
        repoUrl: string;
        branch: string;
    }): Promise<CreateProjectOutput> {
        throw new Error(
            'createProjectFromGit not implemented for NodeFs provider',
        );
    }

    async pauseProject(_input: PauseProjectInput): Promise<PauseProjectOutput> {
        return {};
    }

    async stopProject(_input: StopProjectInput): Promise<StopProjectOutput> {
        return {};
    }

    async listProjects(_input: ListProjectsInput): Promise<ListProjectsOutput> {
        return {};
    }

    async destroy(): Promise<void> {
        // TODO: Implement
    }
}

export class NodeFsFileWatcher extends ProviderFileWatcher {
    start(_input: WatchFilesInput): Promise<void> {
        return Promise.resolve();
    }

    stop(): Promise<void> {
        return Promise.resolve();
    }

    registerCallback(_callback: (event: WatchEvent) => Promise<void>): void {
        // TODO: Implement
    }
}

export class NodeFsTerminal extends ProviderTerminal {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get id(): string {
        return 'unimplemented';
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get name(): string {
        return 'unimplemented';
    }

    open(): Promise<string> {
        return Promise.resolve('');
    }

    write(): Promise<void> {
        return Promise.resolve();
    }

    run(): Promise<void> {
        return Promise.resolve();
    }

    kill(): Promise<void> {
        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOutput(callback: (data: string) => void): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

export class NodeFsTask extends ProviderTask {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get id(): string {
        return 'unimplemented';
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get name(): string {
        return 'unimplemented';
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get command(): string {
        return 'unimplemented';
    }

    open(): Promise<string> {
        return Promise.resolve('');
    }

    run(): Promise<void> {
        return Promise.resolve();
    }

    restart(): Promise<void> {
        return Promise.resolve();
    }

    stop(): Promise<void> {
        return Promise.resolve();
    }

    onOutput(_callback: (data: string) => void): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}

export class NodeFsCommand extends ProviderBackgroundCommand {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get name(): string {
        return 'unimplemented';
    }

    get command(): Promise<string> {
        return Promise.resolve('unimplemented');
    }

    open(): Promise<string> {
        return Promise.resolve('');
    }

    restart(): Promise<void> {
        return Promise.resolve();
    }

    kill(): Promise<void> {
        return Promise.resolve();
    }

    onOutput(_callback: (data: string) => void): () => void {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }
}
