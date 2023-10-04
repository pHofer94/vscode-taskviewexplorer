import * as vscode from 'vscode';
import TreeItem from './TreeItem';

export default class TreeItemFolder extends TreeItem {
    constructor(
        source: string,
        qualifier: string,
        uri: string,
        label: string,
        description: string,
        tooltip: string,
        command?: vscode.Command,
    ) {
        super(
            source,
            qualifier,
            label,
            description,
            tooltip,
            vscode.TreeItemCollapsibleState.Collapsed,
            command,
        );
        if (uri !== '') {
            this.resourceUri = vscode.Uri.file(uri);
        }
    }

    iconPath = vscode.ThemeIcon.Folder;
    resourceUri?: vscode.Uri | undefined;

    contextValue = 'treeItemFolder';
}
