module.exports = {
  title: 'Easy Peasy',
  description: 'Easy Peasy state for React',
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
      { text: 'Tutorial', link: '/docs/tutorial/' },
      { text: 'API', link: '/docs/api/' },
      { text: 'Install', link: '/docs/introduction/installation/' },
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
            'tutorial/creating-store',
            'tutorial/integrating-store',
            'tutorial/accessing-state',
            'tutorial/defining-actions',
            'tutorial/dispatching-actions',
            'tutorial/defining-thunks',
            'tutorial/dispatching-thunks',
            'tutorial/defining-selectors',
            'tutorial/accessing-selectors',
            'tutorial/runtime-arg-selectors',
            'tutorial/responding-actions',
            'tutorial/final-notes',
          ],
        },
        {
          title: 'Typescript Tutorial',
          children: [
            'typescript-tutorial/',
            'typescript-tutorial/create-your-store',
            'typescript-tutorial/typed-hooks',
            'typescript-tutorial/adding-typed-actions',
            'typescript-tutorial/adding-typed-thunks',
            'typescript-tutorial/using-typed-injections',
            'typescript-tutorial/typing-thunk-against-the-store',
            'typescript-tutorial/adding-typed-listeners',
            'typescript-tutorial/adding-typed-selectors',
          ],
        },
        {
          title: 'API',
          children: [
            'api/',
            'api/action',
            'api/create-store',
            'api/debug',
            'api/reducer',
            'api/selector',
            'api/store',
            'api/store-config',
            'api/store-provider',
            'api/thunk',
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
          title: 'Deprecated API',
          children: [
            'deprecated-api/',
            'deprecated-api/create-typed-hooks',
            'deprecated-api/listen',
            'deprecated-api/select',
            'deprecated-api/store',
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
            'recipes/react-native-devtools',
            'recipes/generalising-models',
            'recipes/usage-with-react-redux',
          ],
        },
      ],
    },
  },
};
