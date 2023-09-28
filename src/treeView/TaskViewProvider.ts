import * as vscode from 'vscode';
import { extensionContext } from '../ExtensionContext';
import TreeItem from './treeItems/TreeItem';
import TaskGroupService from './TaskGroupService';
import FetchTasksService from './FetchTasksService';
import { TaskSourceGroupService } from './TaskSourceGroupService';
import { extensionConfiguration } from '../ExtensionConfiguration';
import { logger } from '../logger/Logger';

export class TaskViewProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> =
        new vscode.EventEmitter<TreeItem | undefined | void>();
    public readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> =
        this._onDidChangeTreeData.event;

    private isFlatList: boolean;
    private tasksGroupService: TaskGroupService;
    private fetchTasksService: FetchTasksService;
    private taskSourceGroupService: TaskSourceGroupService;

    constructor(private workspaceRoot: string | undefined) {
        this.isFlatList = extensionContext.view.isFlatList;
        const rootDir = this.workspaceRoot || '';
        this.tasksGroupService = new TaskGroupService();
        this.fetchTasksService = new FetchTasksService(
            !extensionConfiguration.view.showHiddenTasks,
            extensionConfiguration.tasks.favorites,
            rootDir,
        );
        this.taskSourceGroupService = new TaskSourceGroupService(rootDir, this.tasksGroupService);
    }

    refresh(): void {
        extensionContext.view.isLoaded = false;
        this._onDidChangeTreeData.fire();
    }

    viewAsList(): void {
        extensionContext.view.isFlatList = true;
        this.isFlatList = extensionContext.view.isFlatList;
        this.refresh();
    }

    viewAsTree(): void {
        extensionContext.view.isFlatList = false;
        this.isFlatList = extensionContext.view.isFlatList;
        this.refresh();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        let items: TreeItem[] = [];
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No tasks in empty workspace');
        } else {
            try {
                items = await this.createTreeItems(element);
            } catch (ex) {
                const error = ex as Error;
                const message = 'An error occurred during the process of creating the tree items.';
                logger.error(`${message} Details - ${error.message}`);
                vscode.window.showErrorMessage(
                    `${message} For more details, please check the extension's output channel.`,
                );
            }
        }
        extensionContext.view.isLoaded = true;
        return Promise.resolve(items);
    }

    async createTreeItems(element?: TreeItem): Promise<TreeItem[]> {
        let items: TreeItem[] = [];
        if (element) {
            if (this.isFlatList) {
                items = this.taskSourceGroupService.getTreeItemsOfTaskSourceAsFlatList(
                    element.source,
                );
            } else {
                items = this.taskSourceGroupService.getTreeItemsOfTaskSourceAsTreeList(
                    element.source,
                    element.qualifier,
                );
            }
        } else {
            this.fetchTasksService.filterHiddenTasks = !extensionConfiguration.view.showHiddenTasks;
            this.fetchTasksService.favorites = extensionConfiguration.tasks.favorites;
            this.tasksGroupService.groupBySource(await this.fetchTasksService.fetchTasks());

            if (this.tasksGroupService.sourceMap.size === 0) {
                vscode.window.showInformationMessage('Workspace has no tasks configured');
            } else {
                items = this.taskSourceGroupService.getTreeItemRootFoldersOfTaskSources();
            }
        }
        return items;
    }
}
