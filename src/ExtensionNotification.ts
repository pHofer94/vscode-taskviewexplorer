import * as vscode from 'vscode';
import { logger } from './logger/Logger';

function getConfigModifiedMessage(context: vscode.ExtensionContext) {
    return `The ${context.extension.packageJSON.displayName} configuration has been modified.`;
}

class ExtensionNotification {
    public static readonly instance: ExtensionNotification = new ExtensionNotification();
    private extensionContext: vscode.ExtensionContext | undefined = undefined;

    set context(context: vscode.ExtensionContext) {
        this.extensionContext = context;
    }

    public async notifyReload() {
        if (!this.extensionContext) {
            logger.debug(`notifyReload() was called before the extension context was provided.`);
            return;
        }

        const reloadButton = 'Reload';
        const result = await vscode.window.showInformationMessage(
            `${getConfigModifiedMessage(
                this.extensionContext,
            )} Please reload the window for the changes to take effect.`,
            reloadButton,
        );
        if (result === reloadButton) {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
}

export const extensionNotification = ExtensionNotification.instance;
