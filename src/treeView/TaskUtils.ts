import { TaskOriginMap, TaskSourceEnum } from './TaskTypes';
import TreeItemTask from './treeItems/TreeItemTask';
import TreeItem from './treeItems/TreeItem';
import path = require('path');
import TreeItemSubFolder from './treeItems/TreeItemSubFolder';
import Task from '../vscode/Task';

export function normalizeTaskName(name: string, ralativeCwd: string): string {
    const regex = new RegExp(` - ${ralativeCwd.replace(/\\/g, '/')}$`);
    return name.replace(regex, '');
}

export function taskToTreeItem(
    source: string,
    qualifier: string,
    task: Task,
    normalizeName = true,
) {
    let name = task.name;
    if (normalizeName) {
        name = normalizeTaskName(name, qualifier);
    } else if (qualifier !== '') {
        name = `${name} - ${qualifier}`;
    }

    const treeItem = new TreeItemTask(source, qualifier, name, task);
    return treeItem;
}

export function subFolderToTreeItems(
    source: string,
    qualifier: string,
    taskSource: TaskOriginMap,
    workspaceRoot: string,
) {
    const treeItemFolderKeys: string[] = [];
    let treeItems: TreeItem[] = [];
    for (const [key, task] of taskSource) {
        if (key === task.name || key.replace(qualifier, '').replace(/^\\/, '') === task.name) {
            treeItems = treeItems.concat(taskToTreeItem(source, qualifier, task));
        } else {
            let folderName = key;
            if (key.substring(0, qualifier.length) === qualifier) {
                folderName = folderName.substring(qualifier.length, folderName.length);
            }
            folderName = folderName.replace(/^\\/, '').split('\\')[0];
            if (!treeItemFolderKeys.includes(folderName)) {
                treeItemFolderKeys.push(folderName);
                const newQualifier = qualifier === '' ? folderName : `${qualifier}\\${folderName}`;
                treeItems.push(
                    new TreeItemSubFolder(
                        source,
                        newQualifier,
                        path.join(workspaceRoot, newQualifier),
                        folderName,
                        '',
                    ),
                );
            }
        }
    }
    return treeItems;
}
