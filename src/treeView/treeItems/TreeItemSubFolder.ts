import * as vscode from 'vscode';
import TreeItemFolder from './TreeItemFolder';

export default class TreeItemSubFolder extends TreeItemFolder {
    constructor(
        source: string,
        qualifier: string,
        uri: string,
        label: string,
        description: string,
        command?: vscode.Command,
    ) {
        super(source, qualifier, uri, label, description, uri, command);
    }

    iconPath = vscode.ThemeIcon.Folder;

    contextValue = 'treeItemSubFolder';
}
