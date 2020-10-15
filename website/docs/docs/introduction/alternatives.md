# Alternatives

We aren't suggesting that Easy Peasy is _the_ state management solution for
React. It's just one of the options. State management is a certainly a tricky
subject within the React eco system. There are a variety of options available to
you. We don't want to encourage unhealthy competition and truly appreciate the
various options available to the community. We therefore believe it is our
responsibility to inform you of some of your options, and encourage you to
choose a solution that best meets the needs of your application.

- [React Query](#react-queryhttpsreact-querytanstackcom)
- [React's Context and/or Hook APIs](#reacts-context-andor-hook-apishttpsreactjsorgdocsgetting-startedhtml)
- [Zustand](#zustandhttpsgithubcompmndrszustand)
- [Redux Toolkit](#redux-toolkithttpsredux-toolkitjsorg)

## [React Query](https://react-query.tanstack.com/)

Firstly, do you even need state management?? 😅

If you find that the primary requirement for your state management solution is
data synchronization with a server (e.g. GET and POST requests) then you could
almost certainly get away with using
[`react-query`](https://react-query.tanstack.com/) instead.

I highly recommend that you read their
[overview](https://react-query.tanstack.com/docs/overview) docs for a strong
motivation on why you should consider them.

Honestly, I've created a fully featured CRUD application in React utilizing
`react-query` and I wholeheartedly endorse this library. It reduces application
complexity dramatically and prevents you from hitting a whole category of bugs
that can occur when you are trying to manage client/server data synchronization
via a state management solution.

## [React's Context and/or Hook APIs](https://reactjs.org/docs/getting-started.html)

Please consider using the native API's that React has to offer. They are built
into the library so will have greater support and much bigger chance of being
supported for an extended period of time.

You'll be surprised with how far these APIs can take you.

## [Zustand](https://github.com/pmndrs/zustand)

Zustand has a beautifully elegant API, and whilst it isn't as rich in features
as Easy Peasy, it can easily meet the global state management requirements for
most React applications.

I haven't used it directly myself, but I have been keeping my eye on it and
believe it to be a very strong proposition.

Here is a strong motivation for its usage extracted from their readme:

> Don't disregard it because it's cute. It has quite the claws, lots of time was
> spent to deal with common pitfalls, like the dreaded zombie child problem,
> react concurrency, and context loss between mixed renderers. It may be the one
> state-manager in the React space that gets all of these right.

A big bonus is that they growing in popularity at a great rate. Community is a
great force for an open source effort, and an important factor in ensuring you
will get support and can depend on the lifetime of the project.

## [Redux Toolkit](https://redux-toolkit.js.org/)

An official Redux library providing a simplified API interface that avoids
boilerplate. It great simplifies the specification of a Redux store. Once you've
created the store you'll need to install and use the
[React Redux](https://react-redux.js.org/) library to connect it to your
application.

If you are wanting to engage the Redux ecosystem then this alternative has a big
benefit in that it is officially part of that Eco System, and subsequently has a
larger community.

A special shoutout goes to @acemarke for his continued stewardship of the Redux
ecosystem. This library continues take a lot of learnings from him.
