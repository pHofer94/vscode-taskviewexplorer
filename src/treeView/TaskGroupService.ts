import { TaskSourceMap, TaskOriginMap, TaskSourceEnum } from './TaskTypes';
import Task from '../vscode/Task';

export default class TaskGroupService {
    public readonly sourceMap: TaskSourceMap = new Map();

    constructor() {}

    public groupBySource(tasks: Task[]): TaskSourceMap {
        this.sourceMap.clear();
        for (const task of tasks) {
            this.addToSourceMap(task.source, task);

            if (task.isFavorite) {
                this.addToSourceMap(TaskSourceEnum.favorites.toString(), task);
            }
        }
        return this.sourceMap;
    }

    private addToSourceMap(source: string, task: Task) {
        const entry = this.sourceMap.get(source);
        const taskKey = task.getQualifiedName();
        if (entry) {
            entry.set(taskKey, task);
        } else {
            const taskOrigin: TaskOriginMap = new Map();
            taskOrigin.set(taskKey, task);
            this.sourceMap.set(source, taskOrigin);
        }
    }

    public getSource(source: string) {
        return this.sourceMap.get(source);
    }

    public getSourceWhereOriginMatchQualifier(source: string, qualifier: string) {
        const taskSources = this.getSource(source);
        const map: TaskOriginMap = new Map();
        if (taskSources) {
            for (const [source, taskSource] of taskSources) {
                if (source.substring(0, qualifier.length) === qualifier) {
                    map.set(source, taskSource);
                }
            }
        }
        return map;
    }
}
