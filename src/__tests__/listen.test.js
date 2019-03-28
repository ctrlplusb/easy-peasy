import { action, createStore, listen, thunk } from '../index';

it('work as expected', async () => {
  // arrange
  const expectedInjections = { foo: 'bar' };

  const userModel = {
    token: '',
    logIn: thunk(() => {}),
    logOut: action(() => undefined),
  };

  const store = createStore(
    {
      doNothing: action(() => undefined),
      user: userModel,
      audit: {
        logs: [],
        add: action((state, payload) => {
          state.logs.push(payload);
        }),
        userListeners: listen(on => {
          on(
            userModel.logIn,
            thunk(
              (
                actions,
                payload,
                { dispatch, getState, getStoreState, meta, injections },
              ) => {
                expect(payload).toEqual({ username: 'foo', password: 'bar' });
                expect(getStoreState()).toEqual({
                  user: {
                    token: '',
                  },
                  audit: { logs: [] },
                });
                expect(getState()).toEqual({
                  logs: [],
                });
                expect(dispatch).toBe(store.dispatch);
                expect(meta).toEqual({
                  parent: ['audit'],
                  path: ['audit', 'userListeners'],
                });
                expect(injections).toEqual(expectedInjections);
                actions.add('User logged in');
              },
            ),
          );
          on(
            userModel.logOut,
            thunk(actions => {
              actions.add('User logged out');
            }),
          );
        }),
      },
    },
    {
      injections: expectedInjections,
    },
  );

  // act
  store.dispatch.doNothing();

  // assert
  expect(store.getState().audit.logs).toEqual([]);

  // act
  await store.dispatch.user.logIn({ username: 'foo', password: 'bar' });

  const tick = ms => new Promise(resolve => setTimeout(resolve, ms));

  await tick(10);

  // assert
  expect(store.getState().audit.logs).toEqual(['User logged in']);

  // act
  await store.dispatch.user.logOut();

  // assert
  expect(store.getState().audit.logs).toEqual([
    'User logged in',
    'User logged out',
  ]);
});

it('listeners can fire actions to update state', () => {
  // arrange
  const store = createStore({
    audit: {
      routeChangeLogs: [],
      listeners: listen(on => {
        on(
          'ROUTE_CHANGED',
          action((state, payload) => {
            state.routeChangeLogs.push(payload);
          }),
        );
      }),
    },
  });

  // act
  store.dispatch({
    type: 'ROUTE_CHANGED',
    payload: '/about',
  });

  // assert
  expect(store.getState().audit.routeChangeLogs).toEqual(['/about']);
});

it('listens to string actions', () => {
  // arrange
  const store = createStore({
    routeChangeLogs: [],
    log: action((state, payload) => {
      state.routeChangeLogs.push(payload);
    }),
    listeners: listen(on => {
      on(
        'ROUTE_CHANGED',
        thunk((actions, payload) => {
          actions.log(payload);
        }),
      );
    }),
  });

  // act
  store.dispatch({
    type: 'ROUTE_CHANGED',
    payload: '/about',
  });

  // assert
  expect(store.getState().routeChangeLogs).toEqual(['/about']);
});

it('listening to an invalid type does nothing', () => {
  // act
  createStore({
    listeners: listen(on => {
      on(true, thunk(() => {}));
    }),
  });
});

it('listening with an invalid handler does nothing', () => {
  // act
  createStore({
    listeners: listen(on => {
      on('FOO_BAR', true);
    }),
  });
});

it('listening with a function does nothing', () => {
  // act
  createStore({
    listeners: listen(on => {
      on('FOO_BAR', () => undefined);
    }),
  });
});
