import type { SandboxFile } from '@mino/models';

/**
 * Please note that `args` should only contain primitive types so it can be serialized to JSON.
 * This is important so each method below can be called by a LLM.
 */

export interface WriteFileInput {
    args: {
        path: string;
        content: string | Uint8Array;
        overwrite?: boolean;
    };
}

export interface WriteFileOutput {
    success: boolean;
}

export interface StatFileInput {
    args: {
        path: string;
    };
}

export interface StatFileOutput {
    type: 'file' | 'directory';
    // the following fields are not actively used and are set to optional
    // if the code leverages these fields then you may update them to required
    isSymlink?: boolean;
    size?: number;
    mtime?: number;
    ctime?: number;
    atime?: number;
}

export interface RenameFileInput {
    args: {
        oldPath: string;
        newPath: string;
    };
}

export type RenameFileOutput = Record<string, never>;

export interface ListFilesInput {
    args: {
        path: string;
    };
}

export interface ListFilesOutputFile {
    name: string;
    type: 'file' | 'directory';
    isSymlink: boolean;
}

export interface ListFilesOutput {
    files: ListFilesOutputFile[];
}

export interface ReadFileInput {
    args: {
        path: string;
    };
}

export type ReadFileOutputFile = SandboxFile & { toString: () => string };

export interface ReadFileOutput {
    file: ReadFileOutputFile;
}

export interface DeleteFilesInput {
    args: {
        path: string;
        recursive?: boolean;
    };
}

export type DeleteFilesOutput = Record<string, never>;

export interface DownloadFilesInput {
    args: {
        path: string;
    };
}

export interface DownloadFilesOutput {
    url?: string;
}

export interface CopyFilesInput {
    args: {
        sourcePath: string;
        targetPath: string;
        recursive?: boolean;
        overwrite?: boolean;
    };
}

export type CopyFilesOutput = Record<string, never>;

export interface CreateDirectoryInput {
    args: {
        path: string;
    };
}

export type CreateDirectoryOutput = Record<string, never>;

export interface WatchEvent {
    type: 'add' | 'change' | 'remove';
    paths: string[];
}

export interface WatchFilesInput {
    args: {
        path: string;
        recursive?: boolean;
        excludes?: string[];
    };
    onFileChange?: (event: WatchEvent) => Promise<void>;
}

export interface WatchFilesOutput {
    watcher: ProviderFileWatcher;
}

export type CreateTerminalInput = Record<string, never>;
export interface CreateTerminalOutput {
    terminal: ProviderTerminal;
}

export interface GetTaskInput {
    args: {
        id: string;
    };
}

export interface GetTaskOutput {
    task: ProviderTask;
}

export interface TerminalCommandInput {
    args: {
        command: string;
    };
}

export interface TerminalCommandOutput {
    output: string;
}

export interface TerminalBackgroundCommandInput {
    args: {
        command: string;
    };
}

export interface TerminalBackgroundCommandOutput {
    command: ProviderBackgroundCommand;
}

export type GitStatusInput = Record<string, never>;

export interface GitStatusOutput {
    changedFiles: string[];
}

export type InitializeInput = Record<string, never>;
export type InitializeOutput = Record<string, never>;

export type SetupInput = Record<string, never>;
export type SetupOutput = Record<string, never>;

export interface CreateProjectInput {
    source: string;
    id: string;
    title?: string;
    description?: string;
    tags?: string[];
}

export interface CreateProjectOutput {
    id: string;
}

export type PauseProjectInput = Record<string, never>;
export type PauseProjectOutput = Record<string, never>;

export type StopProjectInput = Record<string, never>;
export type StopProjectOutput = Record<string, never>;

export type ListProjectsInput = Record<string, never>;
export type ListProjectsOutput =
    | {
          projects: {
              id: string;
              title: string | undefined;
              description: string | undefined;
              createdAt: Date;
              updatedAt: Date;
          }[];
      }
    | Record<string, never>;

export interface CreateSessionInput {
    args: {
        id: string;
    };
}

export type CreateSessionOutput = Record<string, never>;

export abstract class Provider {
    abstract writeFile(input: WriteFileInput): Promise<WriteFileOutput>;
    abstract renameFile(input: RenameFileInput): Promise<RenameFileOutput>;
    abstract statFile(input: StatFileInput): Promise<StatFileOutput>;
    abstract deleteFiles(input: DeleteFilesInput): Promise<DeleteFilesOutput>;
    abstract listFiles(input: ListFilesInput): Promise<ListFilesOutput>;
    abstract readFile(input: ReadFileInput): Promise<ReadFileOutput>;

    abstract downloadFiles(
        input: DownloadFilesInput,
    ): Promise<DownloadFilesOutput>;

    abstract copyFiles(input: CopyFilesInput): Promise<CopyFilesOutput>;

    abstract createDirectory(
        input: CreateDirectoryInput,
    ): Promise<CreateDirectoryOutput>;

    abstract watchFiles(input: WatchFilesInput): Promise<WatchFilesOutput>;

    abstract createTerminal(
        input: CreateTerminalInput,
    ): Promise<CreateTerminalOutput>;

    abstract getTask(input: GetTaskInput): Promise<GetTaskOutput>;

    abstract runCommand(
        input: TerminalCommandInput,
    ): Promise<TerminalCommandOutput>;

    abstract runBackgroundCommand(
        input: TerminalBackgroundCommandInput,
    ): Promise<TerminalBackgroundCommandOutput>;

    abstract gitStatus(input: GitStatusInput): Promise<GitStatusOutput>;

    /**
     * Called in the backend as it may handle secrets.
     * Returns data for the frontend.
     * The data may be extended for each provider and must be serializable in JSON.
     */
    abstract createSession(
        input: CreateSessionInput,
    ): Promise<CreateSessionOutput>;

    /**
     * `Provider` is meant to be a singleton; this method is called when the first instance is created.
     * Use this to establish a connection or run operations that requires I/O.
     */
    abstract initialize(input: InitializeInput): Promise<InitializeOutput>;

    abstract setup(input: SetupInput): Promise<SetupOutput>;
    abstract reload(): Promise<boolean>;
    abstract reconnect(): Promise<void>;
    abstract ping(): Promise<boolean>;

    static createProject(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        input: CreateProjectInput,
    ): Promise<CreateProjectOutput> {
        throw new Error('createProject must be implemented by subclass');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createProjectFromGit(input: {
        repoUrl: string;
        branch: string;
    }): Promise<CreateProjectOutput> {
        throw new Error('createProjectFromGit must be implemented by subclass');
    }

    abstract pauseProject(
        input: PauseProjectInput,
    ): Promise<PauseProjectOutput>;

    abstract stopProject(input: StopProjectInput): Promise<StopProjectOutput>;

    abstract listProjects(
        input: ListProjectsInput,
    ): Promise<ListProjectsOutput>;

    // this is called when the provider instance is no longer needed
    abstract destroy(): Promise<void>;
}

export abstract class ProviderFileWatcher {
    abstract start(input: WatchFilesInput): Promise<void>;
    abstract stop(): Promise<void>;
    abstract registerCallback(
        callback: (event: WatchEvent) => Promise<void>,
    ): void;
}

export type ProviderTerminalShellSize = {
    cols: number;
    rows: number;
};

export abstract class ProviderTerminal {
    /**
     * Gets the ID of the terminal. Can be used to open it again.
     */
    abstract get id(): string;
    /**
     * Gets the name of the terminal.
     */
    abstract get name(): string;

    abstract open(dimensions?: ProviderTerminalShellSize): Promise<string>;
    abstract write(
        input: string,
        dimensions?: ProviderTerminalShellSize,
    ): Promise<void>;
    abstract run(
        input: string,
        dimensions?: ProviderTerminalShellSize,
    ): Promise<void>;
    abstract kill(): Promise<void>;

    // returns a function to unsubscribe from the event
    abstract onOutput(callback: (data: string) => void): () => void;
}

export abstract class ProviderTask {
    abstract get id(): string;
    abstract get name(): string;
    abstract get command(): string;

    abstract open(): Promise<string>;
    abstract run(): Promise<void>;
    abstract restart(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract onOutput(callback: (data: string) => void): () => void;
}

export abstract class ProviderBackgroundCommand {
    abstract get name(): string | undefined;
    abstract get command(): Promise<string>;
    abstract open(): Promise<string>;
    abstract restart(): Promise<void>;
    abstract kill(): Promise<void>;
    // must call open() before running
    abstract onOutput(callback: (data: string) => void): () => void;
}
