import * as vscode from 'vscode';

interface GetOrigin {
    (task: vscode.Task, rootDir: string): string;
}

type ExecutionUtils = Map<string, GetOrigin>;

export default class TaskOriginUtils {
    private static taskExecutionUtils: ExecutionUtils = TaskOriginUtils.getExecutionUtilsMap();

    private static getExecutionUtilsMap(): ExecutionUtils {
        const map: ExecutionUtils = new Map();
        map.set(vscode.ProcessExecution.toString(), TaskOriginUtils.getProcessExecutionOrigin);
        map.set(vscode.ShellExecution.toString(), TaskOriginUtils.getShellExecutionOrigin);
        map.set('default', TaskOriginUtils.getDefaultOrigin);
        return map;
    }

    public static getOrigin(task: vscode.Task, rootDir: string) {
        let getOriginFnc = this.taskExecutionUtils.get(this.getInstanceName(task.execution));
        if (!getOriginFnc) {
            getOriginFnc = this.getDefaultOrigin;
        }
        return getOriginFnc(task, rootDir);
    }

    public static getInstanceName(
        execution:
            | vscode.ProcessExecution
            | vscode.ShellExecution
            | vscode.CustomExecution
            | undefined,
    ): string {
        if (execution instanceof vscode.ProcessExecution) {
            return vscode.ProcessExecution.toString();
        } else if (execution instanceof vscode.ShellExecution) {
            return vscode.ShellExecution.toString();
        } else {
            return 'default';
        }
    }

    private static getOriginOfCwd(rootDir: string, cwd?: string) {
        if (cwd) {
            const relativePath = cwd
                .replace(/\//g, '\\')
                .replace(rootDir, '')
                .replace(/^\\/, '')
                .replace(/^\${[^}]+}/, '')
                .replace(/^\\/, '')
                .replace(/\\$/, '');
            return relativePath;
        }
        return '';
    }

    private static getProcessExecutionOrigin(task: vscode.Task, rootDir: string): string {
        const execution = task.execution as vscode.ProcessExecution;
        return TaskOriginUtils.getOriginOfCwd(rootDir, execution.options?.cwd);
    }

    private static getShellExecutionOrigin(task: vscode.Task, rootDir: string): string {
        const execution = task.execution as vscode.ShellExecution;
        return TaskOriginUtils.getOriginOfCwd(rootDir, execution.options?.cwd);
    }

    public static getDefaultOrigin(task: vscode.Task, rootDir: string): string {
        return '';
    }
}
