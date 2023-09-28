import * as vscode from 'vscode';
import { EXTENSION_NAME } from './Constants';

export enum Commands {
    refreshView = 'refreshView',
    viewAsList = 'viewAsList',
    viewAsTree = 'viewAsTree',
    runTask = 'runTask',
    addToFavorites = 'addToFavorites',
    removeFromFavorites = 'removeFromFavorites',
}

export function getFullQualifiedCommandName(command: Commands): string {
    return `${EXTENSION_NAME}.${command.toString()}`;
}

export function executeCommand(command: Commands): void {
    vscode.commands.executeCommand(getFullQualifiedCommandName(command));
}
