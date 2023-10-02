import * as vscode from 'vscode';
import { Logger } from './logger/Logger';
import TaskView from './treeView/TaskView';
import ExtensionNotification from './ExtensionNotification';
import ExtensionConfiguration from './ExtensionConfiguration';
import ExtensionContext from './ExtensionContext';
import ExtensionCommands from './ExtensionCommands';

export function activate(context: vscode.ExtensionContext) {
    const displayName = context.extension.packageJSON.displayName;
    const name = context.extension.packageJSON.name;

    const logger = new Logger(displayName);
    const extensionNotification = new ExtensionNotification(displayName, logger);
    const extensionConfiguration = new ExtensionConfiguration(name, logger, extensionNotification);
    context.subscriptions.push(extensionConfiguration);
    logger.setLogLevel(extensionConfiguration.logging.logLevel);
    const extensionContext = new ExtensionContext(name);
    const extensionCommands = new ExtensionCommands(name);

    const rootPath =
        vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

    new TaskView(
        context,
        rootPath,
        logger,
        extensionConfiguration,
        extensionContext,
        extensionCommands,
    );
    extensionContext.isActive = true;
    logger.info(`The extension ${context.extension.packageJSON.displayName} is now active!`);
}

export function deactivate() {}
