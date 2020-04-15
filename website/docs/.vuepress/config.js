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
      { text: 'Docs', link: '/docs/introduction/' },
    ],

    sidebarDepth: 0,

    sidebar: {
      '/docs/': [
        {
          title: 'Introduction',
          children: [
            'introduction/',
            'introduction/installation',
            'introduction/examples',
            'introduction/extensions',
            'introduction/prior-art',
            'introduction/immer',
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
          title: 'API',
          children: [
            'api/',
            {
              title: 'Store',
              children: [
                'api/create-store',
                'api/store-config',
                'api/store-provider',
                'api/store',
              ],
            },
            {
              title: 'Models',
              children: [
                'api/action-on',
                'api/action',
                'api/computed',
                'api/generic',
                'api/listeners',
                'api/persist',
                'api/reducer',
                'api/thunk-on',
                'api/thunk',
              ],
            },
            {
              title: 'Hooks',
              children: [
                'api/use-local-store',
                'api/use-store-actions',
                'api/use-store-dispatch',
                'api/use-store-rehydrated',
                'api/use-store-state',
                'api/use-store',
              ],
            },
            {
              title: 'Multiple Stores',
              children: [
                'api/create-component-store',
                'api/create-context-store',
                'api/use-local-store',
              ],
            },
            {
              title: 'Utils',
              children: ['api/create-transform', 'api/debug', 'api/memo'],
            },
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
          title: 'TypeScript API',
          children: [
            'typescript-api/',
            'typescript-api/action',
            'typescript-api/action-on',
            'typescript-api/actions',
            'typescript-api/computed',
            'typescript-api/create-typed-hooks',
            'typescript-api/generic',
            'typescript-api/reducer',
            'typescript-api/state',
            'typescript-api/thunk',
            'typescript-api/thunk-on',
          ],
        },
        {
          title: 'Testing',
          children: [
            'testing/',
            'testing/testing-actions',
            'testing/testing-components',
            'testing/testing-computed-properties',
            'testing/testing-listeners',
            'testing/testing-thunks',
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
