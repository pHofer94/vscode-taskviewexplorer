import * as vscode from 'vscode';
import TreeItem from './TreeItem';
import { extensionConfiguration } from '../../ExtensionConfiguration';
import { Commands, executeCommand } from '../../Commands';
import Task from '../../vscode/Task';

export default class TreeItemTask extends TreeItem {
    constructor(
        source: string,
        qualifier: string,
        name: string,
        public readonly task: Task,
        command?: vscode.Command,
    ) {
        super(
            source,
            qualifier,
            name,
            task.detail ? task.detail : '',
            task.detail ? `${name}: ${task.detail}` : name,
            vscode.TreeItemCollapsibleState.None,
            command,
        );

        if (task.isFavorite) {
            this.contextValue = `${this.contextValue}Fav`;
        }
    }

    iconPath = new vscode.ThemeIcon('symbol-property');

    contextValue = 'treeItemTask';

    public addToFavorites() {
        extensionConfiguration.tasks.addToFavorites(this.task);
    }

    public removeFromFavorites() {
        extensionConfiguration.tasks.removeFromFavorites(this.task);
    }

    public get vscodeTask() {
        return this.task.task;
    }
}
