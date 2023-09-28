import * as vscode from 'vscode';
import { TaskSourceEnum } from './TaskTypes';
import Task from '../vscode/Task';

interface TaskConfig {
    label?: string;
    hide?: boolean;
    script?: string;
}

export default class FetchTasksService {
    private allTasks: Task[] = [];

    constructor(
        private _filterHiddenTasks: boolean,
        private _favorites: string[],
        private workspaceRoot: string,
    ) {}

    set filterHiddenTasks(value: boolean) {
        this._filterHiddenTasks = value;
    }

    set favorites(value: string[]) {
        this._favorites = value;
    }

    public async fetchTasks(): Promise<Task[]> {
        this.allTasks.splice(0);
        return this.toTasks(await vscode.tasks.fetchTasks());
    }

    public async toTasks(vsCodeTasks: vscode.Task[]): Promise<Task[]> {
        const hiddenTasks = this.getHiddenTasks();
        for (const vsCodeTask of vsCodeTasks) {
            if (
                !this._filterHiddenTasks ||
                vsCodeTask.source !== TaskSourceEnum.workspace.toString() ||
                !hiddenTasks.includes(vsCodeTask.name)
            ) {
                const sources = Task.getSources(vsCodeTask);
                for (const source of sources) {
                    let task = new Task(vsCodeTask, source, this.workspaceRoot);
                    task.isFavorite = this._favorites.includes(task.getFullQualifiedName());
                    this.allTasks.push(task);
                }
            }
        }
        return this.allTasks;
    }

    public getHiddenTasks(): string[] {
        const tasksJson = vscode.workspace.getConfiguration('tasks');
        const tasksConfig = tasksJson.get<TaskConfig[]>('tasks');
        const hiddenTasks: string[] = [];
        if (tasksConfig) {
            try {
                for (const config of tasksConfig) {
                    if (config.hide && (config.label || config.script)) {
                        hiddenTasks.push(config.label || config.script || '');
                    }
                }
            } catch (ex) {
                // nothing to do
            }
        }
        return hiddenTasks;
    }
}
