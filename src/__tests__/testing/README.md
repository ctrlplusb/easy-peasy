# Testing Examples

This test suite provides examples of how to test applications using
easy-peasy. They are included as actual tests of easy-peasy so that we can
assert that all the test helpers work as expected.

When testing your models, we recommend testing each model slice in isolation
rather than testing the entire store. You can import your model under test
and in the "arrange/before" of your test you could use the `createStore` API
providing just your model under test. This helps to isolate your tests and
make them far less vulnerable to code refactoring.