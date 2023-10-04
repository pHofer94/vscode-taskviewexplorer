import * as vscode from 'vscode';
import { subFolderToTreeItems, taskToTreeItem } from './TaskUtils';
import TreeItem from './treeItems/TreeItem';
import TreeItemRootFolder from './treeItems/TreeItemRootFolder';
import TasksGroupService from './TaskSourceGroup';
import { TaskSourceEnum } from './TaskTypes';

function sortTreeItems(a: TreeItem, b: TreeItem) {
    const aCollapsible = a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed;
    const bCollapsible = b.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed;

    if (aCollapsible && !bCollapsible) {
        return -1;
    } else if (!aCollapsible && bCollapsible) {
        return 1;
    } else {
        return a.label.localeCompare(b.label);
    }
}

function sortRootFolders(a: TreeItem, b: TreeItem) {
    const aIsFavorite = a.source === TaskSourceEnum.favorites.toString();
    const bIsFavorite = b.source === TaskSourceEnum.favorites.toString();

    if (aIsFavorite && !bIsFavorite) {
        return -1;
    } else if (!aIsFavorite && bIsFavorite) {
        return 1;
    } else {
        return a.label.localeCompare(b.label);
    }
}

export class TreeItemGroup {
    constructor(
        private workspaceRoot: string,
        private taskSourceGroup: TasksGroupService,
    ) {}

    public getTreeItemRootFoldersOfTaskSources(): TreeItem[] {
        const items: TreeItem[] = [];
        if (this.taskSourceGroup.sourceMap.size > 0) {
            for (const [key] of this.taskSourceGroup.sourceMap) {
                items.push(new TreeItemRootFolder(key));
            }
        }
        return items.sort((a, b) => sortRootFolders(a, b));
    }

    public getTreeItemsOfTaskSourceAsFlatList(source: string): TreeItem[] {
        const items: TreeItem[] = [];
        const taskSource = this.taskSourceGroup.sourceMap.get(source);
        if (taskSource) {
            let treeItems: TreeItem[] = [];
            for (const [key, task] of taskSource) {
                treeItems = treeItems.concat(taskToTreeItem(source, key, task, false));
            }
            return treeItems.sort((a, b) => sortTreeItems(a, b));
        }
        return items;
    }

    public getTreeItemsOfTaskSourceAsTreeList(source: string, qualifier: string): TreeItem[] {
        const items: TreeItem[] = [];
        const taskSource = this.taskSourceGroup.getSource(source);
        if (taskSource) {
            let treeItems: TreeItem[] = [];
            if (source === qualifier) {
                treeItems = subFolderToTreeItems(source, '', taskSource, this.workspaceRoot);
            } else {
                const subTaskSource = this.taskSourceGroup.getSourceWhereOriginMatchQualifier(
                    source,
                    qualifier,
                );
                treeItems = subFolderToTreeItems(
                    source,
                    qualifier,
                    subTaskSource,
                    this.workspaceRoot,
                );
            }
            return treeItems.sort((a, b) => sortTreeItems(a, b));
        }
        return items;
    }
}
