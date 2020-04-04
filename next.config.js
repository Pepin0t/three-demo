const path = require('path');
const withLess = require('@zeit/next-less');

module.exports = withLess({
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: '[local]___[hash:base64:5]',
  },
  webpack: (config) => {
    const { alias } = config.resolve;

    alias['~'] = path.resolve(__dirname, 'src');

    return config;
  },
});
