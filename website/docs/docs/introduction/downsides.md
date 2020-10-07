# Tradeoffs & Downsides

This was originally a [question posed on our GitHub repository](https://github.com/ctrlplusb/easy-peasy/issues/468). The answer seemed to get a good response from the community and there was a request to make this visible on the website.

- [Question](#questionhttpsgithubcomctrlplusbeasy-peasyissues468)
- [Answer](#answerhttpsgithubcomctrlplusbeasy-peasyissues468issuecomment-612549556)
  - [We are built on top of Redux](#we-are-built-on-top-of-redux)
  - [Our abstraction is leaky](#our-abstraction-is-leaky)
  - [We are not an official state management solution](#we-are-not-an-official-state-management-solution)
  - [Increased bundle size](#increased-bundle-size)
  - [Increased onboarding experience](#increased-onboarding-experience)

## [Question](https://github.com/ctrlplusb/easy-peasy/issues/468)

**What are downsides of easy-peasy?**

This library is lightweight and has less APIs and still manages to get the job done amazingly

Just wondering what tradeoffs you made while developing this library?

## [Answer](https://github.com/ctrlplusb/easy-peasy/issues/468#issuecomment-612549556)

That's a great question, and I will try to answer it as honestly as I can. I may be blinded by my own bias so I welcome any other feedback from others to add to the list.

### We are built on top of Redux

There are certainly trade offs that have been made here. We are bound to the API and capabilities of Redux under the hood.

Redux is a very popular solution though and has been battle tested over many years, so I thought it was a fair trade to make. It allowed me to provide support for the greater many tools that the Redux community have built, such as the Redux dev tools.

It also saved me from having to go through the optimizations journey that the Redux team have already been through. We have a reliable engine.

### Our abstraction is leaky

Whilst we abstract away Redux, the abstraction is leaky. There are many places you can observe, in terms of the design of our API, that knowledge of Redux would certainly help you have an even stronger understanding of how Easy Peasy works.

We've also specifically exposed the ability to extend the underlying Redux store, which is an even bigger leak. 😅

Again, I felt like the benefits outweighed the trade offs, and by introducing some Redux specific APIs (like the reducer), and exposing the store, we have been given the ability to introduce a migration path for those whom are currently on a traditional Redux implementation.

### We are not an official state management solution

You are introducing a 3rd party dependency into your application. That is always a risk. Apart from the possibility from it falling out of maintenance there is also the possibility it may not evolve with the architecture of React as it is based on assumptions about the current implementation of React.

For example, there could be issues with the upcoming concurrent mode feature of React. This is a general issue for a lot of global state libraries though however, and the React team is introducing a useMutableSource hook which should allow this library and others to evolve into their next architecture model. So it's low risk for now, but I think it's a good example of the type of thing that could occur.

### Increased bundle size

By adopting this library you no doubt will bump the size of your bundle. If you are serving communities with really slow internet speeds this should always be a consideration.

Easy Peasy bundled with all it's deps is approximately 11kb gzipped right now. Not crazy big, but still good to consider based on your needs.

### Increased onboarding experience

You would also increase the learning curve for new developers to your application. Whilst we are certainly growing in adoption I think it is safe to say we are nowhere near Redux/MobX level of popularity. So it's very likely that any new members of your team will have to familiarize themselves with this library.

That being said, a primary goal of this library was to create an API that is intuitive and easy, so hopefully the impact would be negligible.
