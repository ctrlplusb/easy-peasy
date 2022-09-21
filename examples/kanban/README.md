# Kanban example ([View codesandbox](https://codesandbox.io/s/5zdk6r))

Kanban example of `react` and `easy-peasy`.

![Kanban app with easy-peasy](./resources/kanban-app.gif)

This is a `Vite + React + Typescript + Eslint + Prettier` example based on [this template](https://github.com/TheSwordBreaker/vite-reactts-eslint-prettier).

The example also includes tests using `vitest`, `@testing-library/react` & `@testing-library/user-event`.

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/components/App.tsx`. The page auto-updates as you edit the file.

The `easy-peasy` store & models are located in the `src/store` folder.
The `main.tsx` file wraps the `<App />` component with the `<StoreProvider>`, so all child components can access the
hooks exposed from the `store/index.ts`.

[Session storage persistance](https://easy-peasy.vercel.app/docs/api/persist.html) is used for this app, setup in the `store/index.ts`.

## Testing

This example is using the `vitest` engine, but the same principles & consepts can also be applied for the `jest` engine.

Execute the tests by running

```bash
yarn test
```

- See `store/model.test.ts` for an example of how to test models.
- See `components/**/*.test.tsx` for an example of how to test views. (Utilizing `utils/test-utils.tsx` to setup each test case)
