# Tutorial

This tutorial will teach you Easy Peasy by refactoring [an existing application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k). We will step by step refactor [this application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k), introducing each of the core concepts and APIs of Easy Peasy as we progress.

> If you are looking for a quick fire overview then we recommend you read the [quickstart tutorial](/docs/introduction/quickstart).

[The application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) that we are going to refactor is a naive shopping cart. It lists some products and allows you to click a product and thereafter add it to your basket. You can also view your basket by clicking the link in the top right corner, which will display a list of the products currently added to your basket along with the ability to remove them.

In refactoring [the application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) we will start with the state first, and then gradually introduce each of the APIs (e.g. [action](/docs/api/action), [thunk](/docs/api/thunk), etc).  We highly recommend that you familiarise yourself with the [target application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) before you proceed, and invite you to fork it and perform the refactoring described within each section of the tutorial. We will be showing you _all_ the changes that you will need to make to [the application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) in order to make the introduced concepts work.

Each section will end with a link to a snapshot of [the application](https://codesandbox.io/s/easy-peasy-tutorial-start-8qz5k) with the all the refactoring up to that point applied to it.

We hope that you find this tutorial helpful and invite you to provide feedback on the [GitHub repo](https://github.com/ctrlplusb/easy-peasy).
