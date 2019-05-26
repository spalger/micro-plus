module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: '10',
        },
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
}