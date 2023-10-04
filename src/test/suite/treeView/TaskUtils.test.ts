import * as assert from 'assert';
import { normalizeTaskName } from '../../../treeView/TaskUtils';

suite('TaskUtils Test Suite', () => {
    let cwd = 'any/dir';
    let name = 'anyTaskName';
    let nameWithCwd = '';

    setup(() => {
        nameWithCwd = `${name} - ${cwd}`;
    });

    suite('normalizeTaskName', () => {
        test('name contains cwd and cwd is provided - cwd is replaced', () => {
            const result = normalizeTaskName(nameWithCwd, cwd);
            assert.strictEqual(result, name);
        });

        test('name contains cwd and wrong cwd is provided - cwd is not replaced', () => {
            const result = normalizeTaskName(nameWithCwd, `${cwd}/any`);
            assert.strictEqual(result, nameWithCwd);
        });

        test('name does not contain cwd and cwd is provided - result is equal to name', () => {
            const result = normalizeTaskName(name, cwd);
            assert.strictEqual(result, name);
        });
    });
});
