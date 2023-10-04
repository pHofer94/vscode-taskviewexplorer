import * as vscode from 'vscode';
import { Logger } from './logger/Logger';

export default class ExtensionNotification {
    public constructor(
        private readonly extensionName: string,
        private logger: Logger,
    ) {}

    public async notifyReload() {
        if (!this.extensionName) {
            this.logger.debug(
                `notifyReload() was called before the extension context was provided.`,
            );
            return;
        }

        const reloadButton = 'Reload';
        const result = await vscode.window.showInformationMessage(
            `${this.getConfigModifiedMessage()} Please reload the window for the changes to take effect.`,
            reloadButton,
        );
        if (result === reloadButton) {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }

    private getConfigModifiedMessage() {
        return `The ${this.extensionName} configuration has been modified.`;
    }
}
