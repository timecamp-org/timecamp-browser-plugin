TimeCamp Google Chrome Time Tracking Extension
===============

## Configuration

1. Copy `.npmrc.dist` to `.npmrc` or use:
```bash
  cp ./.npmrc.dist ./.npmrc
```

2. Set `authToken` in `.npmrc`. You can find it [here](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers)

3. Run
```bash
  yarn install
```

## Build for production

1. `unset SERVER_DOMAIN` - just in case if you changed for development
2. `yarn run build` - it creates archive `dist/tc-google-chrome-extension.zip` and directory `dist/plugin` with same unzipped files

## Build for development

1. Change backend url by creating environment variable:

   `export SERVER_DOMAIN=000000.ngrok.io`

   or change `ENV.SERVER_DOMAIN` directly in `webpack.config.js`
2. Set your backend url in `scripts/config.js` (This step will be removed soon)
3. Run: `yarn run build-dev` it creates `dist/plugin` directory
4. Open `chrome://extensions/`
5. Select Developer mode
6. Disable current TimeCamp plugin if you have any
7. Click `Load unpacked` and select a folder where you have `dist/plugin`

## Version

Plugin version is stored only in `package.json`

Version from `package.json`:`version` is copied to `manifest.json`:`version`


## Debbugging

Steps to open background console:
1. Go to `chrome://extensions/`
2. Open `details` of extension
3. Click `background page` under `Inspect views`


## Other
[Extensions-reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid): Useful plugin for fast extension reloading

[React-cosmos](https://github.com/react-cosmos/react-cosmos): Useful lib for developing and testing react components
