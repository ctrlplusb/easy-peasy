module.exports = {
  title: 'Easy Peasy v4',
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
      { text: 'Docs', link: '/docs/introduction/' },
      { text: 'v3 Docs', link: 'https://easy-peasy-v3.now.sh' },
    ],

    sidebarDepth: 0,

    sidebar: {
      '/docs/': [
        {
          title: 'Introduction',
          path: '/docs/introduction/',
          children: [
            'introduction/installation',
            'introduction/quick-start',
            'introduction/alternatives',
            'introduction/downsides',
            'introduction/browser-support',
            // 'introduction/examples',
            // 'introduction/prior-art',
          ],
        },
        {
          title: 'Tutorials',
          path: '/docs/tutorials/',
          children: [
            'tutorials/standard',
            'tutorials/advanced',
            'tutorials/typescript',
          ],
        },
        {
          title: 'API',
          path: '/docs/api/',
          children: [
            {
              title: 'Creating Stores',
              children: [
                'api/create-store',
                'api/store-config',
                'api/store-provider',
                'api/store',
                'api/create-context-store',
                'api/use-local-store',
              ],
            },
            {
              title: 'Defining Store Models',
              children: [
                'api/action-on',
                'api/action',
                'api/computed',
                'api/effect-on',
                'api/generic',
                'api/listeners',
                'api/persist',
                'api/reducer',
                'api/thunk-on',
                'api/thunk',
              ],
            },
            {
              title: 'Using Stores via Hooks',
              children: [
                'api/use-store-actions',
                'api/use-store-dispatch',
                'api/use-store-rehydrated',
                'api/use-store-state',
                'api/use-store',
              ],
            },
            {
              title: 'Utils',
              children: ['api/create-transform', 'api/debug', 'api/memo'],
            },
          ],
        },
        /*
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
        */
        {
          title: 'TypeScript API',
          path: '/docs/typescript-api/',
          children: [
            'typescript-api/action',
            'typescript-api/action-on',
            'typescript-api/actions',
            'typescript-api/computed',
            'typescript-api/create-typed-hooks',
            'typescript-api/effect-on',
            'typescript-api/generic',
            'typescript-api/reducer',
            'typescript-api/state',
            'typescript-api/thunk',
            'typescript-api/thunk-on',
          ],
        },
        {
          title: 'Testing',
          path: '/docs/testing/',
          children: [
            'testing/testing-actions',
            'testing/testing-components',
            'testing/testing-computed-properties',
            'testing/testing-listeners',
            'testing/testing-thunks',
          ],
        },
        {
          title: 'Community Extensions',
          path: '/docs/community-extensions/',
        },
        {
          title: 'Recipes',
          path: '/docs/recipes/',
          children: [
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
          path: '/docs/known-issues/',
          children: ['known-issues/using-keyof-in-generic-typescript-model'],
        },
      ],
    },
  },
};
