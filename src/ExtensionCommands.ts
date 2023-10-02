import * as vscode from 'vscode';

export enum CommandsEnum {
    refreshView = 'refreshView',
    viewAsList = 'viewAsList',
    viewAsTree = 'viewAsTree',
    runTask = 'runTask',
    addToFavorites = 'addToFavorites',
    removeFromFavorites = 'removeFromFavorites',
}

export default class ExtensionCommands {
    public constructor(private readonly extensionName: string) {}

    public executeCommand(command: CommandsEnum): void {
        vscode.commands.executeCommand(this.getFullQualifiedCommandName(command));
    }

    public getFullQualifiedCommandName(command: CommandsEnum): string {
        return `${this.extensionName}.${command.toString()}`;
    }
}
