import * as vscode from 'vscode';
import TaskOriginUtils from '../treeView/TaskOriginUtils';
import { TaskSourceEnum } from '../treeView/TaskTypes';

export default class Task {
    public isFavorite = false;
    public readonly task: vscode.Task;
    public readonly name: string;

    constructor(
        task: vscode.Task,
        public readonly source: string,
        private rootDir: string,
    ) {
        this.task = task;
        this.name = this.getNameDependingOnSource();
    }

    private getNameDependingOnSource() {
        if (this.source === TaskSourceEnum.npm.toString()) {
            return (this.task.definition as { type: string; script: string }).script;
        }
        return this.task.name;
    }

    public getQualifiedName() {
        let origin = TaskOriginUtils.getOrigin(this.task, this.rootDir);
        if (origin !== '') {
            origin = `${origin}\\`;
        }
        return `${origin}${this.name}`;
    }

    public getFullQualifiedName() {
        return `${this.source}\\${this.getQualifiedName()}`;
    }

    public static getSourceNormalized(source: string) {
        return source === TaskSourceEnum.workspace.toString()
            ? TaskSourceEnum.vscode.toString()
            : source;
    }

    public static getSources(task: vscode.Task) {
        const source = this.getSourceNormalized(task.source);
        const sourceNames = [source];
        const type = task.definition.type;
        if (
            source === TaskSourceEnum.vscode.toString() &&
            !type.match(/^\$.+$/) &&
            type !== task.source
        ) {
            sourceNames.push(task.definition.type);
        }
        return sourceNames;
    }

    public get detail() {
        return this.task.detail;
    }
}
