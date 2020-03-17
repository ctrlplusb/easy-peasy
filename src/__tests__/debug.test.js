import { debug, action, createStore, model } from '../index';
import { mockConsole } from './utils';

let restore;

beforeEach(() => {
  restore = mockConsole();
});

afterEach(() => {
  restore();
});

it('should return state with changes applied', () => {
  // arrange
  const store = createStore(
    model({
      logs: ['foo'],
      add: action((state, payload) => {
        expect(debug(state)).toEqual({ logs: ['foo'] });
        state.logs.push(payload);
        expect(debug(state)).toEqual({ logs: ['foo'] });
      }),
    }),
  );

  // act
  store.getActions().add('bar');

  // assert
  expect(store.getState()).toEqual({ logs: ['foo', 'bar'] });
});

it('returns argument when not a draft', () => {
  // arrange
  const notADraft = { foo: 'bar' };

  // act
  const actual = debug(notADraft);

  // assert
  expect(actual).toBe(notADraft);
});
