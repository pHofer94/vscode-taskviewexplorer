import * as vscode from 'vscode';
import Task from './vscode/Task';
import { EXTENSION_NAME } from './Constants';
import { logger } from './logger/Logger';
import { extensionNotification } from './ExtensionNotification';

function getDefaultValueIfConfigHasWrongTypeLogIfError<T extends Object>(
    config: T,
    defaultValue: T,
    type: string,
    configName: string,
) {
    try {
        throwIfConfigIsNotOfExpectedType(config, type, configName);
        return config;
    } catch (ex) {
        const error = ex as Error;
        vscode.window.showWarningMessage(error.message);
        logger.warning(error.message);
        return defaultValue;
    }
}

function throwIfConfigIsNotOfExpectedType<T extends Object>(
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

class ExtensionConfiguration {
    public static readonly instance: ExtensionConfiguration = new ExtensionConfiguration();
    public static readonly configRootKey = EXTENSION_NAME;
    private readonly _onConfigChangeForRefresh = new vscode.EventEmitter<void>();
    public readonly onConfigChangeForRefresh = this._onConfigChangeForRefresh.event;

    private constructor() {
        vscode.workspace.onDidChangeConfiguration((e) => {
            this.checkIfRefreshOfViewIsNeeded(e);
            this.checkIfReloadIsNeeded(e);
        });
    }

    private checkIfRefreshOfViewIsNeeded(event: vscode.ConfigurationChangeEvent) {
        const configKeysForReloadRequired = [
            `${ExtensionConfiguration.configRootKey}.${this.view.showHiddenTasksKey}`,
            `${ExtensionConfiguration.configRootKey}.${this.tasks.favoritesKey}`,
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
            if (event.affectsConfiguration(`${ExtensionConfiguration.configRootKey}.${key}`)) {
                extensionNotification.notifyReload();
                break;
            }
        }
    }

    public static getConfiguration() {
        return vscode.workspace.getConfiguration(this.configRootKey);
    }

    public view = new (class {
        constructor() {}

        public readonly showHiddenTasksKey = 'view.showHiddenTasks';
        public get showHiddenTasks() {
            return ExtensionConfiguration.getConfiguration().get(this.showHiddenTasksKey, false);
        }
    })();

    public logging = new (class {
        constructor() {}

        public readonly logLevelKey = 'logging.logLevel';
        public get logLevel() {
            return toLogLevel(
                ExtensionConfiguration.getConfiguration().get(this.logLevelKey, 'Info') || 'Info',
            );
        }
    })();

    public tasks = new (class {
        constructor() {}

        public readonly favoritesKey = 'tasks.favorites';
        public get favorites() {
            return getDefaultValueIfConfigHasWrongTypeLogIfError<string[]>(
                ExtensionConfiguration.getConfiguration().get(this.favoritesKey, []),
                [],
                'Array',
                this.favoritesKey,
            );
        }

        public set favorites(values: string[]) {
            ExtensionConfiguration.getConfiguration().update(this.favoritesKey, values);
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
    })();
}

export const extensionConfiguration = ExtensionConfiguration.instance;
