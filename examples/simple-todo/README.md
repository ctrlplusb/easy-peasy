# Simple todo example ([View codesandbox](https://codesandbox.io/s/fnidh1))

The simplest example of `react` and `easy-peasy`.

![Todo app with easy-peasy](./resources/todo-app.gif)

This is a `Vite + React + Typescript + Eslint + Prettier` example based on [this template](https://github.com/TheSwordBreaker/vite-reactts-eslint-prettier).

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
