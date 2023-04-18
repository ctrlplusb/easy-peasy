module.exports = {
  title: 'Easy Peasy v6',
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
      { text: 'v3', link: 'https://easy-peasy-v3.vercel.app/' },
      { text: 'v4', link: 'https://easy-peasy-v4.vercel.app/' },
      { text: 'v5', link: 'https://easy-peasy-v5.vercel.app/' },
    ],

    sidebarDepth: 0,

    sidebar: {
      '/docs/': [
        {
          title: 'Introduction',
          path: '/docs/introduction/',
          children: [
            'introduction/installation',
            'introduction/alternatives',
            'introduction/downsides',
            'introduction/browser-support',
          ],
        },
        {
          title: 'Tutorials',
          path: '/docs/tutorials/',
          children: [
            'tutorials/quick-start',
            'tutorials/primary-api',
            'tutorials/typescript',
            'tutorials/testing',
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
              children: ['api/create-transform', 'api/debug'],
            },
            {
              title: 'TypeScript Types',
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
          children: [
            'known-issues/typescript-optional-computed-properties',
            'known-issues/using-keyof-in-generic-typescript-model',
          ],
        },
      ],
    },
  },
};
