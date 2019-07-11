module.exports = {
  title: 'Easy Peasy',
  description: 'Vegetarian friendly state for React',
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-89235861-3',
      },
    ],
  ],
  themeConfig: {
    repo: 'ctrlplusb/easy-peasy',

    docsRepo: 'ctrlplusb/easy-peasy',
    docsDir: 'website/docs',
    docsBranch: 'master',

    editLinks: true,
    editLinkText: 'Help us improve this page!',

    lastUpdated: 'Last Updated',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/docs/quick-start' },
      { text: 'Tutorial', link: '/docs/tutorial/' },
      { text: 'API', link: '/docs/api/' },
      { text: 'TypeScript', link: '/docs/typescript-tutorial/' },
    ],

    sidebarDepth: 0,

    sidebar: {
      '/docs/': [
        {
          title: 'Introduction',
          children: [
            'introduction/overview',
            'introduction/installation',
            'introduction/examples',
            'introduction/prior-art',
          ],
        },
        {
          title: 'Tutorial',
          children: [
            'tutorial/',
            'tutorial/create-your-store',
            'tutorial/connecting-your-store',
            'tutorial/consuming-state',
            'tutorial/using-actions-to-update-state',
            'tutorial/using-thunks-to-perform-side-effects',
            'tutorial/using-computed-properties',
            'tutorial/using-listeners',
            'tutorial/redux-dev-tools',
            'tutorial/final-notes',
          ],
        },
        {
          title: 'TypeScript Tutorial',
          children: [
            'typescript-tutorial/',
            'typescript-tutorial/create-your-store',
            'typescript-tutorial/typed-hooks',
            'typescript-tutorial/adding-typed-actions',
            'typescript-tutorial/adding-typed-thunks',
            'typescript-tutorial/using-typed-injections',
            'typescript-tutorial/typing-thunk-against-the-store',
            'typescript-tutorial/adding-typed-listeners',
            'typescript-tutorial/adding-typed-computed',
            'typescript-tutorial/typing-computed-with-store-state',
            'typescript-tutorial/final-notes',
          ],
        },
        {
          title: 'API',
          children: [
            'api/',
            'api/action',
            'api/action-on',
            'api/computed',
            'api/create-store',
            'api/create-typed-hooks',
            'api/debug',
            'api/listeners',
            'api/memo',
            'api/reducer',
            'api/store',
            'api/store-config',
            'api/store-provider',
            'api/thunk',
            'api/thunk-on',
            'api/use-store-actions',
            'api/use-store-dispatch',
            'api/use-store-state',
          ],
        },
        {
          title: 'Extended API',
          children: [
            'extended-api/create-component-store',
            'extended-api/create-context-store',
          ],
        },
        {
          title: 'Testing',
          children: [
            'testing/',
            'testing/testing-actions',
            'testing/testing-thunks',
            'testing/testing-components',
          ],
        },
        {
          title: 'Recipes',
          children: [
            'recipes/',
            'recipes/connecting-to-reactotron',
            'recipes/generalising-models',
            'recipes/hot-reloading',
            'recipes/interop-with-existing-react-redux-app',
            'recipes/react-native-devtools',
            'recipes/usage-with-react-redux',
          ],
        },
        {
          title: 'Known Issues',
          children: [
            'known-issues/',
            'known-issues/using-keyof-in-generic-typescript-model',
          ],
        },
      ],
    },
  },
};
