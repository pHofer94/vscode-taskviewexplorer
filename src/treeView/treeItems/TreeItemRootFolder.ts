import * as vscode from 'vscode';
import TreeItemFolder from './TreeItemFolder';

export default class TreeItemRootFolder extends TreeItemFolder {
    constructor(source: string, command?: vscode.Command) {
        super(source, source, source, source, '', `All ${source} tasks`, command);
    }

    iconPath = vscode.ThemeIcon.Folder;

    contextValue = 'treeItemRootFolder';
}
