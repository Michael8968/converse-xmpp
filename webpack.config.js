/**
 * Webpack main configuration file
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const environment = require('./configuration/environment');

module.exports = {
  entry: path.resolve(environment.paths.source, '', 'headless.js'),
  output: {
    filename: 'index.js',
    path: environment.paths.output,
    library: 'converse',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|gif|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'images/design/[name].[hash:6].[ext]',
              publicPath: '../',
              limit: environment.limits.images,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'fonts/[name].[hash:6].[ext]',
              publicPath: '../',
              limit: environment.limits.fonts,
            },
          },
        ],
      },
    ],
  },
  target: 'web',
};
