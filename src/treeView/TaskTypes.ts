import Task from '../vscode/Task';

export enum TaskSourceEnum {
    npm = 'npm',
    favorites = 'favorites',
    vscode = '.vscode',
    workspace = 'Workspace',
}

export type TaskSourceMap = Map<string, TaskOriginMap>;
export type TaskOriginMap = Map<string, Task>;

export interface TaskConfig {
    label: string;
    hide?: boolean;
}

export interface TaskGroupOptions {
    regexPattern: string;
    separator: string;
}
