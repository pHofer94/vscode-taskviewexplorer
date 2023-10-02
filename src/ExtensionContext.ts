import * as vscode from 'vscode';

export default class ExtensionContext {
    public readonly isActiveKey = 'isActive';
    private _isActive = false;

    public constructor(private readonly rootKey: string) {
        this.isActive = false;
    }

    public get isActive(): boolean {
        return this._isActive;
    }

    public set isActive(value: boolean) {
        this._isActive = value;
        vscode.commands.executeCommand('setContext', this.getContextKey(this.isActiveKey), value);
    }

    private getContextKey(key: string) {
        return `${this.rootKey}.${key}`;
    }

    public view = new (class {
        public readonly isFlatListKey = 'view.isFlatList';
        private isFlatList_ = false;
        public readonly isLoadedKey = 'view.isLoaded';
        private _isLoaded = false;

        constructor(private readonly rootContext: ExtensionContext) {
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
                this.rootContext.getContextKey(this.isFlatListKey),
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
                this.rootContext.getContextKey(this.isLoadedKey),
                value,
            );
        }
    })(this);
}
