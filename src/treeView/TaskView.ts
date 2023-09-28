import * as vscode from 'vscode';
import { TaskViewProvider } from './TaskViewProvider';
import TreeItemTask from './treeItems/TreeItemTask';
import { Commands, getFullQualifiedCommandName } from '../Commands';
import { extensionConfiguration } from '../ExtensionConfiguration';

export default class TaskView {
    constructor(context: vscode.ExtensionContext, workspaceRoot: string | undefined) {
        const taskViewProvider = new TaskViewProvider(workspaceRoot);
        const view = vscode.window.createTreeView('taskView', {
            treeDataProvider: taskViewProvider,
            showCollapseAll: true,
        });
        const viewExplorer = vscode.window.createTreeView('taskViewExplorer', {
            treeDataProvider: taskViewProvider,
            showCollapseAll: true,
        });

        extensionConfiguration.onConfigChangeForRefresh(() => taskViewProvider.refresh());
        context.subscriptions.push(view);
        context.subscriptions.push(viewExplorer);
        vscode.commands.registerCommand(getFullQualifiedCommandName(Commands.refreshView), () => {
            taskViewProvider.refresh();
        });
        vscode.commands.registerCommand(getFullQualifiedCommandName(Commands.viewAsList), () =>
            taskViewProvider.viewAsList(),
        );
        vscode.commands.registerCommand(getFullQualifiedCommandName(Commands.viewAsTree), () =>
            taskViewProvider.viewAsTree(),
        );
        vscode.commands.registerCommand(
            getFullQualifiedCommandName(Commands.runTask),
            (treeItem: TreeItemTask) => {
                if (treeItem && treeItem.task) {
                    vscode.tasks.executeTask(treeItem.vscodeTask);
                } else {
                    vscode.window.showErrorMessage(
                        'The provided task for the command is undefined.',
                    );
                }
            },
        );
        vscode.commands.registerCommand(
            getFullQualifiedCommandName(Commands.addToFavorites),
            (treeItem: TreeItemTask) => {
                if (treeItem && treeItem.task) {
                    treeItem.addToFavorites();
                } else {
                    vscode.window.showErrorMessage(
                        'The provided task for the command is undefined.',
                    );
                }
            },
        );
        vscode.commands.registerCommand(
            getFullQualifiedCommandName(Commands.removeFromFavorites),
            (treeItem: TreeItemTask) => {
                if (treeItem && treeItem.task) {
                    treeItem.removeFromFavorites();
                } else {
                    vscode.window.showErrorMessage(
                        'The provided task for the command is undefined.',
                    );
                }
            },
        );
    }
}
