import * as vscode from 'vscode';

export default abstract class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly source: string,
        public readonly qualifier: string,
        public readonly label: string,
        public readonly description: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
        this.tooltip = this.tooltip;
        this.description = this.description;
    }
    contextValue = 'treeItem';
}
