module.exports = {
  title: 'Easy Peasy 3.x',
  description: 'Easy peasy global state for React',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tutorial', link: '/tutorial/' },
      { text: 'API', link: '/api/' },
      { text: 'Typescript', link: '/typescript/' },
      { text: 'Testing', link: '/testing/' },
      { text: 'GitHub', link: 'https://github.com/ctrlplusb/easy-peasy' },
    ],
    sidebar: {
      '/tutorial/': [
        '',
        'installation',
        'creating-store',
        'integrating-store',
        'accessing-state',
        'defining-actions',
        'dispatching-actions',
        'defining-thunks',
        'dispatching-thunks',
        'defining-selectors',
        'accessing-selectors',
        'responding-actions',
        'final-notes',
      ],

      '/api/': [
        '',
        'action',
        'create-component-store',
        'create-context-store',
        'create-store',
        'reducer',
        'selector',
        'store-config',
        'store-provider',
        'thunk',
        'use-store-actions',
        'use-store-dispatch',
        'use-store-state',
      ],

      '/typescript/': [''],

      '/testing/': [''],
    },
  },
};
