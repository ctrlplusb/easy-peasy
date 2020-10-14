# Architecture

Easy Peasy is a full abstraction over Redux, providing an API that is both intuitive and quick to develop against, whilst removing any need for boilerplate. By wrapping Redux we get to leverage its mature architecture, whilst also being able to support the amazing tooling that has formed around it. For example, we support the [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension) out of the box.

In addition to this, as we are outputing a Redux store, this allows interop with existing libraries and applications that are using React Redux. A big benefit of this is that you can apply a gradual migration of your existing applications from React Redux into Easy Peasy.

To help support migration and interoperability we expose configuration allowing the extension of the underlying Redux store via middleware and enhancers.

That being said, absolutely no Redux experience is required to use Easy Peasy.
