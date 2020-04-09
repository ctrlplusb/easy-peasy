# Testing Showcase

This test suite showcases different strategies for testing your `easy-peasy` 
store as well as components that are consuming your store.

When testing your models, we recommend testing each model slice in isolation
rather than testing the entire store. You can import your model under test
and in the "arrange/before" of your test you could use the `createStore` API
providing just your model under test. This helps to isolate your tests and
make them far less vulnerable to code refactoring.