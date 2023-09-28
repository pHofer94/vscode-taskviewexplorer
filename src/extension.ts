import * as vscode from 'vscode';
import { logger } from './logger/Logger';
import TaskView from './treeView/TaskView';
import { extensionContext } from './ExtensionContext';
import { extensionConfiguration } from './ExtensionConfiguration';
import { extensionNotification } from './ExtensionNotification';

export function activate(context: vscode.ExtensionContext) {
    logger.setLogLevel(extensionConfiguration.logging.logLevel);
    extensionNotification.context = context;
    const rootPath =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

    new TaskView(context, rootPath);
    extensionContext.isActive = true;
    logger.info('The extension "Task View" is now active!');
}

export function deactivate() {}
