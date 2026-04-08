const { NODE_ENV } = process.env;

module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets:
          NODE_ENV === 'test'
            ? { node: 18 }
            : 'defaults, not dead',
        modules: false,
        loose: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-react-jsx',
    NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
  ].filter(Boolean),
};
