# easy-peasy

Easy peasy state management

```javascript
import easyPeasy from 'easy-peasy';

const store = easyPeasy({
  count: 1,
  inc: (state) => {
    state.count++
  }
});

store.dispatch.inc();

store.getState();
/*
{
  count: 2
}
*/
```

[![npm](https://img.shields.io/npm/v/easy-peasy.svg?style=flat-square)](http://npm.im/easy-peasy)
[![MIT License](https://img.shields.io/npm/l/easy-peasy.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/easy-peasy.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/easy-peasy)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/easy-peasy.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/easy-peasy)

## Features

  - Easy to use
  - Supports async actions
  - Redux dev tools integration

## TOCs

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Core Concepts](#core-concepts)

## Introduction

Coming soon to a codebase near you.

## Installation

```bash
npm install easy-peasy
```

Or, if you prefer `yarn`:

```bash
yarn add easy-peasy
```

## Core Concepts

Todo