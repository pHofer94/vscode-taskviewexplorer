import * as vscode from 'vscode';
import { TaskViewProvider } from './TaskViewProvider';
import TreeItemTask from './treeItems/TreeItemTask';
import { Logger } from '../logger/Logger';
import ExtensionConfiguration from '../ExtensionConfiguration';
import ExtensionCommands, { CommandsEnum } from '../ExtensionCommands';
import ExtensionContext from '../ExtensionContext';

export default class TaskView {
    public constructor(
        context: vscode.ExtensionContext,
        workspaceRoot: string | undefined,
        logger: Logger,
        extensionConfiguration: ExtensionConfiguration,
        extensionContext: ExtensionContext,
        extensionCommands: ExtensionCommands,
    ) {
        const taskViewProvider = new TaskViewProvider(
            workspaceRoot,
            logger,
            extensionConfiguration,
            extensionContext,
        );
        const view = vscode.window.createTreeView('taskView', {
            treeDataProvider: taskViewProvider,
            showCollapseAll: true,
        });
        const viewExplorer = vscode.window.createTreeView('taskViewExplorer', {
            treeDataProvider: taskViewProvider,
            showCollapseAll: true,
        });

        context.subscriptions.push(
            extensionConfiguration.onConfigChangeForRefresh(() => taskViewProvider.refresh()),
        );
        context.subscriptions.push(view);
        context.subscriptions.push(viewExplorer);
        context.subscriptions.push(taskViewProvider);

        vscode.commands.registerCommand(
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.refreshView),
            () => {
                taskViewProvider.refresh();
            },
        );
        vscode.commands.registerCommand(
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.viewAsList),
            () => taskViewProvider.viewAsList(),
        );
        vscode.commands.registerCommand(
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.viewAsTree),
            () => taskViewProvider.viewAsTree(),
        );
        vscode.commands.registerCommand(
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.runTask),
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
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.addToFavorites),
            (treeItem: TreeItemTask) => {
                if (treeItem && treeItem.task) {
                    extensionConfiguration.tasks.addToFavorites(treeItem.task);
                } else {
                    vscode.window.showErrorMessage(
                        'The provided task for the command is undefined.',
                    );
                }
            },
        );
        vscode.commands.registerCommand(
            extensionCommands.getFullQualifiedCommandName(CommandsEnum.removeFromFavorites),
            (treeItem: TreeItemTask) => {
                if (treeItem && treeItem.task) {
                    extensionConfiguration.tasks.removeFromFavorites(treeItem.task);
                } else {
                    vscode.window.showErrorMessage(
                        'The provided task for the command is undefined.',
                    );
                }
            },
        );
    }
}
