import { createStore } from 'easy-peasy';
import { describe, expect, it } from 'vitest';

import model from './model';
import { Task } from './taskList.model';

describe('store model', () => {
  it('should progress task from todo to doing', () => {
    // Arrange
    const store = createStore(model);
    const task: Task = { id: 'task-id', name: 'Task name' };
    store.getActions().todo.addTask(task);

    // Act
    store.getActions().todo.progressTask(task);

    // Assert
    const tasksInProgress = store.getState().doing.tasks;
    expect(tasksInProgress).toContain(task);
  });

  it('should progress task from doing to done', () => {
    // Arrange
    const store = createStore(model);
    const task: Task = { id: 'task-id', name: 'Task name' };
    store.getActions().doing.addTask(task);

    // Act
    store.getActions().doing.progressTask(task);

    // Assert
    const completedTasks = store.getState().done.tasks;
    expect(completedTasks).toContain(task);
  });

  it('should regress task from done to doing', () => {
    // Arrange
    const store = createStore(model);
    const task: Task = { id: 'task-id', name: 'Task name' };
    store.getActions().done.addTask(task);

    // Act
    store.getActions().done.regressTask(task);

    // Assert
    const tasksInProgress = store.getState().doing.tasks;
    expect(tasksInProgress).toContain(task);
  });

  it('should regress task from doing to todo', () => {
    // Arrange
    const store = createStore(model);
    const task: Task = { id: 'task-id', name: 'Task name' };
    store.getActions().doing.addTask(task);

    // Act
    store.getActions().doing.regressTask(task);

    // Assert
    const todoTasks = store.getState().todo.tasks;
    expect(todoTasks).toContain(task);
  });
});
