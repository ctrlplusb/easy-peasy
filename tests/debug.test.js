import { debug, action, createStore } from '../src';
import { mockConsole } from './utils';

let restore;

beforeEach(() => {
  restore = mockConsole();
});

afterEach(() => {
  restore();
});

it('should return state with changes applied', () => {
  // ARRANGE
  const store = createStore({
    logs: ['foo'],
    add: action((state, payload) => {
      expect(debug(state)).toEqual({ logs: ['foo'] });
      state.logs.push(payload);
      expect(debug(state)).toEqual({ logs: ['foo', 'bar'] });
    }),
  });

  // ACT
  store.getActions().add('bar');

  // ASSERT
  expect(store.getState()).toEqual({ logs: ['foo', 'bar'] });
});

it('returns argument when not a draft', () => {
  // ARRANGE
  const notADraft = { foo: 'bar' };

  // ACT
  const actual = debug(notADraft);

  // ASSERT
  expect(actual).toBe(notADraft);
});
