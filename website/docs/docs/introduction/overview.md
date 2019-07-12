# Overview

Easy Peasy provides you with an <strong>intuitive</strong> API to <strong>quickly</strong> and <strong>easily</strong> manage the state for your React application. Batteries are included - <strong>no configuration</strong> is required to support derived state, API calls, performance optimisation, developer tools etc.

## Highlights

  - Zero configuration
  - No boilerplate
  - React hooks based API
  - Computed properties - i.e. derived data
  - Data fetching / side effects
  - Testing helpers
  - TypeScript definitions included
  - Global, shared, or component level stores
  - React Native supported
  - Redux Dev Tools supported
  - Hot Reloading supported

## Underlying Architecture

Under the hood we use Redux to power the store. 😱

Yes, we have noticed a lot of negative sentiment toward Redux recently. However, we feel that this is usually directed at the boilerplate and configuration that is typical within a Redux application. Discounting the boilerplate, the architectural design of Redux is awesome, providing us with characteristics that fit well into the React paradigm.

Therefore we provide a complete abstraction over Redux, providing an API that is both intuitive and quick to develop against. By wrapping Redux we get to leverage its mature architecture, whilst also being able to support the amazing tooling that has formed around it. For example, we support the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension) out of the box. 

We have even taken this further by outputing a Redux store, which would allow you to interop your Easy Peasy created store with existing libraries and applications based on Redux / React Redux. This unlocks a kinder migration path for those currently using React Redux. 

Finally, for the most advanced use cases, we allow extension of the underlying Redux store via middleware and enhancers - provided via our `createStore` configuration.

That all been said, absolutely no Redux experience is required to use Easy Peasy. Once you read through the tutorial you should have all the knowledge and confidence you need to be able to integrate Easy Peasy into your application.