import * as vscode from 'vscode';
import Task from './vscode/Task';
import { Logger } from './logger/Logger';
import ExtensionNotification from './ExtensionNotification';

function toLogLevel(value: string): vscode.LogLevel {
    let logLevel = vscode.LogLevel.Info;
    switch (value) {
        case 'Debug':
            logLevel = vscode.LogLevel.Debug;
            break;
        case 'Error':
            logLevel = vscode.LogLevel.Error;
            break;
        case 'Warning':
            logLevel = vscode.LogLevel.Warning;
            break;
        case 'Info':
            logLevel = vscode.LogLevel.Info;
            break;
        default:
            logLevel = vscode.LogLevel.Info;
            break;
    }
    return logLevel;
}

export default class ExtensionConfiguration implements vscode.Disposable {
    private readonly _onConfigChangeForRefresh = new vscode.EventEmitter<void>();
    public readonly onConfigChangeForRefresh = this._onConfigChangeForRefresh.event;
    private readonly disposables: vscode.Disposable[] = [];

    public constructor(
        public readonly rootKey: string,
        private logger: Logger,
        private extensionNotification: ExtensionNotification,
    ) {
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                this.checkIfRefreshOfViewIsNeeded(e);
                this.checkIfReloadIsNeeded(e);
            }),
        );
    }

    public dispose() {
        this.disposables.splice(0).forEach((d) => d.dispose());
    }

    private checkIfRefreshOfViewIsNeeded(event: vscode.ConfigurationChangeEvent) {
        const configKeysForReloadRequired = [
            `${this.rootKey}.${this.view.showHiddenTasksKey}`,
            `${this.rootKey}.${this.tasks.favoritesKey}`,
            'tasks.tasks',
        ];
        for (const key of configKeysForReloadRequired) {
            if (event.affectsConfiguration(key)) {
                this._onConfigChangeForRefresh.fire();
                break;
            }
        }
    }

    private checkIfReloadIsNeeded(event: vscode.ConfigurationChangeEvent) {
        const configKeysForReloadRequired = [this.logging.logLevelKey];
        for (const key of configKeysForReloadRequired) {
            if (event.affectsConfiguration(`${this.rootKey}.${key}`)) {
                this.extensionNotification.notifyReload();
                break;
            }
        }
    }

    public getConfiguration() {
        return vscode.workspace.getConfiguration(this.rootKey);
    }

    public getDefaultValueIfConfigHasWrongTypeLogIfError<T extends Object>(
        config: T,
        defaultValue: T,
        type: string,
        configName: string,
    ) {
        try {
            this.throwIfConfigIsNotOfExpectedType(config, type, configName);
            return config;
        } catch (ex) {
            const error = ex as Error;
            vscode.window.showWarningMessage(error.message);
            this.logger.warning(error.message);
            return defaultValue;
        }
    }

    private throwIfConfigIsNotOfExpectedType<T extends Object>(
        config: T,
        type: string,
        configName: string,
    ) {
        if (config.constructor.name !== type) {
            throw Error(
                `The configuration parameter ${configName} is not of the expected type ${type}. A default value is used for further processing.`,
            );
        }
    }

    public view = new ExtensionLoggingConfiguration(this);
    public logging = new ExtensionViewConfiguration(this);
    public tasks = new ExtensionTasksConfiguration(this);
}

class ExtensionLoggingConfiguration {
    constructor(private readonly rootCfg: ExtensionConfiguration) {}

    public readonly showHiddenTasksKey = 'view.showHiddenTasks';
    public get showHiddenTasks() {
        return this.rootCfg.getConfiguration().get(this.showHiddenTasksKey, false);
    }
}

class ExtensionViewConfiguration {
    constructor(private readonly rootCfg: ExtensionConfiguration) {}

    public readonly logLevelKey = 'logging.logLevel';
    public get logLevel() {
        return toLogLevel(this.rootCfg.getConfiguration().get(this.logLevelKey, 'Info') || 'Info');
    }
}

class ExtensionTasksConfiguration {
    constructor(private readonly rootCfg: ExtensionConfiguration) {}

    public readonly favoritesKey = 'tasks.favorites';
    public get favorites() {
        return this.rootCfg.getDefaultValueIfConfigHasWrongTypeLogIfError<string[]>(
            this.rootCfg.getConfiguration().get(this.favoritesKey, []),
            [],
            'Array',
            this.favoritesKey,
        );
    }

    public set favorites(values: string[]) {
        this.rootCfg.getConfiguration().update(this.favoritesKey, values);
    }

    public addToFavorites(task: Task) {
        const key = task.getFullQualifiedName();
        const _favorites = this.favorites;

        if (_favorites.includes(key)) {
            vscode.window.showInformationMessage('The task is already a favorite.');
        } else {
            _favorites.push(key);
        }
        this.favorites = _favorites;
    }

    public removeFromFavorites(task: Task) {
        const key = task.getFullQualifiedName();
        const _favorites = this.favorites;

        if (_favorites.includes(key)) {
            this.favorites = _favorites.filter((item) => item !== key);
        } else {
            vscode.window.showInformationMessage('The task is not a favorite.');
        }
    }
}
