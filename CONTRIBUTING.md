# Contributing

**Working on your first Pull Request?** You can learn how from this _free_
series [How to Contribute to an Open Source Project on GitHub][egghead]

## Project setup

1.  Fork and clone the repo
2.  Ensure you have a modern version of Node (>= 14) and Yarn installed
3.  Run `yarn install` to install the project's dependencies
4.  Create a branch for your PR with `git checkout -b <category>/<your-branch-name>`, e.g. `fix/some-bug`

## Creating Pull Requests

To keep your `master` branch in sync with the upstream repository, run the following commands in your local copy:

```
git remote add upstream https://github.com/ctrlplusb/easy-peasy.git
git fetch upstream
git branch --set-upstream-to=upstream/master master
```

This will add the original repository as a "remote" called "upstream," then fetch the git information from that remote, then set your local `master` branch
to pull from the upstream master branch whenever you run `git pull`.

Before you create a new pull request branch, ensure you're on `master` and sync your local with the upstream repo:

```
git checkout master && git pull
```

This will ensure your pull request is always based off of the latest upstream code.

If new commits are added to the upstream `master` branch while you're working on your pull request, with a clean working directory, you can run:

```
git checkout master && git pull
git checkout your-pr-branch
git rebase master
```

Assuming you've followed all of the above steps, this will switch back to the `master` branch and pull the latest upstream code, switch back to your pull request branch, and rebase that branch with `master`. If there are no conflicts, you will then have the latest upstream commits, with your commits on top of them.

## Conventional Commits

We loosely follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. While this convention is not strictly enforced, please try your best to follow this convention when crafting your commit messages. For example:

```
feat: add cool new feature
```

While the above is OK for small changes, detailed commit messages can help reviewers better understand your intent in proposing a change:

```
feat: add cool new feature

* detail about implementation of and/or motivation
for the cool new feature

* additional helpful details
```

## Linting & Testing

ESLint and our test suite will be run before every commit. Any violations of fixable ESLint rules will be fixed automatically, however any un-fixable rule violations or failing tests will cause will cause the commit to be rejected.

You can run the tests or ESLint manually at any time with the following commands:

```powershell
# run tests on source code only
yarn test:source

# run all tests, including TypeScript compilation tests
# this is only required if changes have been made to TypeScript types
yarn test

# run eslint on source code and test files
yarn lint
```

## Types / TypeScript Tests

If your PR introduces changes to the easy-peasy API, please update `index.d.ts` to reflect those changes.

You can confirm that all of the current TypeScript compilation tests still pass by running:

```
yarn test
```

Depending on the change you've introduced, it may make sense to modify or add new TypeScript tests, which can be found [here](tests/typescript/).

## Help Wanted

Please checkout the [the open issues][issues]! Issues labeled ["good first issue"][first-issues] are a good place to start for newcomers.

Also, please watch the repo and respond to questions/bug reports/feature
requests! Thanks!

[egghead]: https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github

[issues]: https://github.com/ctrlplusb/easy-peasy/issues

[first-issues]: https://github.com/ctrlplusb/easy-peasy/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22