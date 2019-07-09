# Overview

Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, performance optimisation, developer tools etc.

## Features

  - Zero configuration
  - No boilerplate
  - Intuitive API
  - React hooks to use store within components
  - Thunks for data fetching and side effects
  - Computed properties - i.e. derived data
  - Global, shared, or component level stores
  - Immutable data store under the hood
  - Includes robust TypeScript definitions
  - React Native supported
  - Includes APIs to aid testing
  - Redux Dev Tools support preconfigured
  - Supports Redux middleware

## Architecture

Under the hood we use Redux to power the store. We have noticed some negative sentiment toward Redux from some parts of the community, but we feel that this is usually directed at the boilerplate and configuration that is typically required to use Redux within an application. Discounting the boilerplate, the architectural design of Redux is still profound, providing us with amazing guarantees that fit so well into the world of React.

Therefore we have decided to wrap Redux, preconfiguring it to meet our usual requirements, and providing an API that is both intuitive and quick to develop against. By wrapping Redux we get to leverage its mature architecture, whilst also being able to support the amazing tooling that has formed around it. For example, we support the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension) out of the box. We even output a Redux store, which would allow you to interop your Easy Peasy created store with existing libraries that require a Redux store be provided to them. In addition to this, for the most advanced use cases, we allow extension of the underlying Redux store via middleware and enhancers.

That being said, absolutely no Redux experience is required to use Easy Peasy. Once you read through the tutorial you should have all the knowledge and confidence you need to be able to integrate Easy Peasy into your application.
