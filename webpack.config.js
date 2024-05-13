const fs = require('fs');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');
const ManifestBuilder = require('./ManifestBuilder.js');

const ENV = {
  SERVER_PROTOCOL: process.env.SERVER_PROTOCOL || 'https',
  SERVER_DOMAIN: process.env.SERVER_DOMAIN || 'app.timecamp.com',
  NEXT_SERVER_DOMAIN: "v4.api.timecamp.com",
  MARKETING_PAGE_DOMAIN: 'www.timecamp.com', 
  GOOGLE_ANALYTICS_ID: 'UA-4525089-16'
};

module.exports = (env, argv) => {
module.exports = (env, argv) => {
  let version = pkg.version;
  let development = false;
  let production = false;
  if (argv.mode === 'production') {
    production = true;
  }
  if (argv.mode === 'development') {
    development = true;
  }

  console.log({
    'development': development,
    'production': production
  });

  return {
    target: 'web',
    context: path.resolve(__dirname),
    devtool: 'source-map',
    entry: {
      ...entry('main', 'scss', '/style/'),
      ...entry('common'),
      ...entry('ApiService'),
      ...entry('PathService'),
      ...entry('TimeFormatter'),
      ...entry('popup'),
      ...entry('background', 'js', '', '', 'background-2.0'),
      ...entryThirdPartyScripts()
    },
    output: {
      publicPath: '',
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    optimization: {
      minimize: production
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.scss']
    },
    node: {
      global: false
    },

    module: {
      rules: [
        {
          test: /\.(gif)$/i,
          exclude: /node_modules/,
          loader: 'file-loader',
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'ts-loader'
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.svg$/,
          loader: 'svg-url-loader'
        },
        {
          test: /\.s[ac]ss$/i,
          exclude: /node_modules|main\.scss/,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ]
        },
        {
          test: /main\.scss/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'file-loader',
              options: { outputPath: 'plugin/scripts-2.0/style/', name: '[name].min.css'}
            },
            "sass-loader"
          ]
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new EnvironmentPlugin({
        SERVER_PROTOCOL: ENV.SERVER_PROTOCOL,
        SERVER_DOMAIN: ENV.SERVER_DOMAIN,
        NEXT_SERVER_DOMAIN: ENV.NEXT_SERVER_DOMAIN,
        DEBUG: development,
        MARKETING_PAGE_DOMAIN: ENV.MARKETING_PAGE_DOMAIN,
        GOOGLE_ANALYTICS_ID: development ? '' : ENV.GOOGLE_ANALYTICS_ID
      }),
      new CleanPlugin(),
      new CopyPlugin({'patterns': [
          ...copy({
            from: '_locales/',
            to: '_locales/'
          }),
          ...copy({
            from: 'fonts/',
            to: 'fonts/'
          }),
          ...copy({
            from: 'images/',
            to: 'images/'
          }),
          ...copy({
            from: 'styles/',
            to: 'styles/'
          }),
          ...copy({
            from: 'scripts/',
            to: '../plugin/scripts/',
            transform: transformOldConfig()
          }),
          ...copy({
            from: 'popup.html',
            to: '../plugin/'
          }),
          {
            from: 'manifest.json',
            to: 'plugin/manifest.json',
            transform: transformManifest(development)
          }
        ]}, { copyUnmodified: true }),
      new FileManagerPlugin({
        events: {
          onEnd: {
            ...(production && {
              delete: [
                'dist/**/*.js.map'
              ],
            })
          }
        }
      })
    ].filter(Boolean)
  };};

function entry (
    name,
    ext = 'js',
    from = '',
    to = '',
    destName = name
) {
  return {
    [`plugin/scripts-2.0/${to}${destName}`]: `./scripts-2.0/${from}${name}.${ext}`
  };
}

function entryThirdPartyScripts() {
  const contentScriptFiles = fs.readdirSync('./scripts-2.0/third_party/');
  return contentScriptFiles.reduce((entries, file) => {
    const name = file.replace('.js', '');
    return Object.assign(entries, entry(`${name}`, 'js', 'third_party/', 'third_party/'));
  }, {});
}

function copy (o) {
  return [
    {
      ...o,
      to: `plugin/${o.to}`
    }
  ];
}

function transformOldConfig() {
    return function (content, filePath) {
      let PATH_SEPARATOR = process.platform === 'win32' ? '\\' : '/';

      if (filePath.split(PATH_SEPARATOR).pop() === 'config.js') {
          let serverUrl = 'var serverUrl="' + ENV.SERVER_PROTOCOL + '://' + ENV.SERVER_DOMAIN + '/' + '";';

          return Buffer.from(serverUrl + content.toString());
      }

      return Buffer.from(content.toString());
    }
}

function transformManifest(isDebug = false) {
  return function (content) {
    const manifest = JSON.parse(content.toString());
    manifest.homepage_url = ENV.SERVER_PROTOCOL + '://' + ENV.SERVER_DOMAIN + '/';
    manifest.host_permissions = [
      ...manifest.host_permissions,
      ENV.SERVER_PROTOCOL + '://*.' + ENV.SERVER_DOMAIN + '/*'
    ];

    manifest.externally_connectable.matches = [
      ...manifest.externally_connectable.matches,
      ENV.SERVER_PROTOCOL + '://' + ENV.SERVER_DOMAIN + '/*'
    ];

    manifest.content_scripts = [
      ...manifest.content_scripts,
      ...ManifestBuilder.build(isDebug)
    ];

    manifest.version = pkg.version;

    return Buffer.from(JSON.stringify(manifest, undefined, 2));
  };
}
