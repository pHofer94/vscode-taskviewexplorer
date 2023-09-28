import * as vscode from 'vscode';
import { EXTENSION_NAME } from './Constants';

class ExtensionContext {
    public static readonly instance: ExtensionContext = new ExtensionContext();
    public static readonly contextRootKey = EXTENSION_NAME;
    public readonly isActiveKey = 'isActive';
    private _isActive = false;

    private constructor() {
        this.isActive = false;
    }

    public get isActive(): boolean {
        return this._isActive;
    }

    public set isActive(value: boolean) {
        this._isActive = value;
        vscode.commands.executeCommand(
            'setContext',
            ExtensionContext.getContextKey(this.isActiveKey),
            value,
        );
    }

    public static getContextKey(key: string) {
        return `${ExtensionContext.contextRootKey}.${key}`;
    }

    public view = new (class {
        public readonly isFlatListKey = 'view.isFlatList';
        private isFlatList_ = false;
        public readonly isLoadedKey = 'view.isLoaded';
        private _isLoaded = false;

        constructor() {
            this.isFlatList = false;
            this.isLoaded = false;
        }

        public get isFlatList(): boolean {
            return this.isFlatList_;
        }

        public set isFlatList(value: boolean) {
            this.isFlatList_ = value;
            vscode.commands.executeCommand(
                'setContext',
                ExtensionContext.getContextKey(this.isFlatListKey),
                value,
            );
        }

        public get isLoaded(): boolean {
            return this._isLoaded;
        }

        public set isLoaded(value: boolean) {
            this._isLoaded = value;
            vscode.commands.executeCommand(
                'setContext',
                ExtensionContext.getContextKey(this.isLoadedKey),
                value,
            );
        }
    })();
}

export const extensionContext = ExtensionContext.instance;
