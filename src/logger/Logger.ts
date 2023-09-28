import * as vscode from 'vscode';
import LogEntry from './LogEntry';
import { LogLevel } from 'vscode';
import { EXTENSION_NAME } from '../Constants';

type LogCallback = (message: string) => void;

class Logger {
    public static readonly instance: Logger = new Logger();

    public channel: vscode.OutputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
    private _infoFnc: LogCallback = this._logInfo;
    private _warningFnc: LogCallback = this._ignoreLogging;
    private _errorFnc: LogCallback = this._ignoreLogging;
    private _debugFnc: LogCallback = this._ignoreLogging;

    public get info(): LogCallback {
        return this._infoFnc;
    }

    public get warning(): LogCallback {
        return this._warningFnc;
    }

    public get error(): LogCallback {
        return this._errorFnc;
    }

    public get debug(): LogCallback {
        return this._debugFnc;
    }

    public setLogLevel(logLevel: vscode.LogLevel) {
        if (logLevel === vscode.LogLevel.Debug) {
            this.setDebugLogLevelFunctions();
        } else if (logLevel === vscode.LogLevel.Error) {
            this.setErrorLogLevelFunctions();
        } else if (logLevel === vscode.LogLevel.Warning) {
            this.setWarningLogLevelFunctions();
        } else {
            this.setInfoLogLevelFunctions();
        }
    }

    private setInfoLogLevelFunctions() {
        this._infoFnc = this._logInfo;
        this._warningFnc = this._ignoreLogging;
        this._errorFnc = this._ignoreLogging;
        this._debugFnc = this._ignoreLogging;
    }

    private setWarningLogLevelFunctions() {
        this._infoFnc = this._logInfo;
        this._warningFnc = this._logWarning;
        this._errorFnc = this._ignoreLogging;
        this._debugFnc = this._ignoreLogging;
    }

    private setErrorLogLevelFunctions() {
        this._infoFnc = this._logInfo;
        this._warningFnc = this._logWarning;
        this._errorFnc = this._logError;
        this._debugFnc = this._ignoreLogging;
    }

    private setDebugLogLevelFunctions() {
        this._infoFnc = this._logInfo;
        this._warningFnc = this._logWarning;
        this._errorFnc = this._logError;
        this._debugFnc = this._logDebug;
    }

    private _ignoreLogging(message: string) {
        // nothing to do
    }

    private _logInfo(message: string) {
        const logEntry = new LogEntry(vscode.LogLevel.Info, message);
        this.channel.appendLine(this.formatLogEntry(logEntry));
    }

    private _logWarning(message: string) {
        const logEntry = new LogEntry(vscode.LogLevel.Warning, message);
        this.channel.appendLine(this.formatLogEntry(logEntry));
    }

    private _logError(message: string) {
        const logEntry = new LogEntry(vscode.LogLevel.Error, message);
        this.channel.appendLine(this.formatLogEntry(logEntry));
    }

    private _logDebug(message: string) {
        const logEntry = new LogEntry(vscode.LogLevel.Debug, message);
        this.channel.appendLine(this.formatLogEntry(logEntry));
    }

    private formatLogEntry(logEntry: LogEntry): string {
        const time = logEntry.timestamp.toLocaleTimeString();
        const millis = logEntry.timestamp.getMilliseconds().toString().padStart(3, '0');
        const level = LogLevel[logEntry.level].padStart(7, ' ');
        const header = `[${time}.${millis} - ${level}]`;
        const message = logEntry.message;
        return `${header} ${message}`;
    }
}

export const logger = Logger.instance;
