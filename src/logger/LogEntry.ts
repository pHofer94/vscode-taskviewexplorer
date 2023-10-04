import { LogLevel } from 'vscode';

export default class LogEntry {
    public readonly timestamp: Date;
    public readonly level: LogLevel;
    public readonly message: string;

    constructor(level: LogLevel, message: string) {
        this.timestamp = new Date();
        this.level = level;
        this.message = message;
    }
}
