import * as vscode from 'vscode';
import TreeItem from './treeItems/TreeItem';
import TaskSourceGroup from './TaskSourceGroup';
import FetchTasksService from './FetchTasksService';
import { TreeItemGroup } from './TreeItemGroup';
import { Logger } from '../logger/Logger';
import ExtensionConfiguration from '../ExtensionConfiguration';
import ExtensionContext from '../ExtensionContext';

export class TaskViewProvider implements vscode.TreeDataProvider<TreeItem>, vscode.Disposable {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> =
        new vscode.EventEmitter<TreeItem | undefined | void>();
    public readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> =
        this._onDidChangeTreeData.event;
    private readonly disposables: vscode.Disposable[] = [];

    private isFlatList: boolean;
    private taskSourceGroup: TaskSourceGroup;
    private fetchTasksService: FetchTasksService;
    private taskItemGroup: TreeItemGroup;

    constructor(
        private workspaceRoot: string | undefined,
        private readonly logger: Logger,
        private readonly extensionConfiguration: ExtensionConfiguration,
        private readonly extensionContext: ExtensionContext,
    ) {
        this.isFlatList = extensionContext.view.isFlatList;
        const rootDir = this.workspaceRoot || '';
        this.fetchTasksService = new FetchTasksService(
            !extensionConfiguration.view.showHiddenTasks,
            extensionConfiguration.tasks.favorites,
            rootDir,
        );
        this.taskSourceGroup = new TaskSourceGroup();
        this.disposables.push(
            this.fetchTasksService.onNewTask((task) => this.taskSourceGroup.addTask(task)),
        );
        this.taskItemGroup = new TreeItemGroup(rootDir, this.taskSourceGroup);
    }

    public dispose() {
        this.disposables.splice(0).forEach((d) => d.dispose());
    }

    refresh(): void {
        this.extensionContext.view.isLoaded = false;
        this._onDidChangeTreeData.fire();
    }

    viewAsList(): void {
        this.extensionContext.view.isFlatList = true;
        this.isFlatList = this.extensionContext.view.isFlatList;
        this.refresh();
    }

    viewAsTree(): void {
        this.extensionContext.view.isFlatList = false;
        this.isFlatList = this.extensionContext.view.isFlatList;
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
                this.logger.error(`${message} Details - ${error.message}`);
                vscode.window.showErrorMessage(
                    `${message} For more details, please check the extension's output channel.`,
                );
            }
        }
        this.extensionContext.view.isLoaded = true;
        return Promise.resolve(items);
    }

    async createTreeItems(element?: TreeItem): Promise<TreeItem[]> {
        let items: TreeItem[] = [];
        if (element) {
            if (this.isFlatList) {
                items = this.taskItemGroup.getTreeItemsOfTaskSourceAsFlatList(element.source);
            } else {
                items = this.taskItemGroup.getTreeItemsOfTaskSourceAsTreeList(
                    element.source,
                    element.qualifier,
                );
            }
        } else {
            this.taskSourceGroup.sourceMap.clear();
            this.fetchTasksService.filterHiddenTasks =
                !this.extensionConfiguration.view.showHiddenTasks;
            this.fetchTasksService.favorites = this.extensionConfiguration.tasks.favorites;
            await this.fetchTasksService.fetchTasks();

            if (this.taskSourceGroup.sourceMap.size === 0) {
                vscode.window.showInformationMessage('Workspace has no tasks configured');
            } else {
                items = this.taskItemGroup.getTreeItemRootFoldersOfTaskSources();
            }
        }
        return items;
    }
}
