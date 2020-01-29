import { createDraft, finishDraft, isDraft } from 'immer-peasy';
import get from './get';

function newify(currentPath, currentState, finalValue) {
  if (currentPath.length === 0) {
    return finalValue;
  }
  const newState = { ...currentState };
  const key = currentPath[0];
  if (currentPath.length === 1) {
    newState[key] = finalValue;
  } else {
    newState[key] = newify(currentPath.slice(1), newState[key], finalValue);
  }
  return newState;
}

export default function createSimpleProduce(disableImmer = false) {
  return function simpleProduce(path, state, fn) {
    if (disableImmer) {
      const current = get(path, state);
      const next = fn(current);
      if (current !== next) {
        return newify(path, state, next);
      }
      return state;
    }
    if (path.length === 0) {
      const draft = createDraft(state);
      const result = fn(draft);
      if (result) {
        return isDraft(result) ? finishDraft(result) : result;
      }
      return finishDraft(draft);
    }
    const parentPath = path.slice(0, path.length - 1);
    const draft = createDraft(state);
    const parent = get(parentPath, state);
    const current = get(path, draft);
    const result = fn(current);

    if (result) {
      parent[path[path.length - 1]] = result;
    }
    return finishDraft(draft);
  };
}
