module.exports = {
  title: 'Easy Peasy',
  description: 'Easy Peasy state for React',
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  themeConfig: {
    repo: 'ctrlplusb/easy-peasy',

    docsRepo: 'ctrlplusb/easy-peasy',
    docsDir: 'website',
    docsBranch: 'next',

    editLinks: true,
    editLinkText: 'Help us improve this page!',

    lastUpdated: 'Last Updated',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Install', link: '/docs/introduction/installation/' },
      { text: 'Tutorial', link: '/docs/tutorial/' },
      { text: 'API', link: '/docs/api/' },
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
          title: 'Typescript Tutorial',
          children: [
            'typescript-tutorial/',
            // 'typescripting-declare-model-interface',
            // 'typescript/create-your-model',
          ],
        },
        {
          title: 'Typescript API',
          children: [
            'typescript-api/',
            // 'typescripting-declare-model-interface',
            // 'typescript-api/create-your-model',
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
