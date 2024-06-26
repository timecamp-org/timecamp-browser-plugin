# TimeCamp Browser Plugin Extension

## Configuration

1. Install Node `v16.17.1`
2. Copy `.npmrc.dist` to `.npmrc` or use:

```bash
  cp ./.npmrc.dist ./.npmrc
```

3. Set `authToken` in `.npmrc`. You can find it [here](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers)
4. Run

```bash
  npm install  --legacy-peer-deps
```

## Build for production

1. `unset SERVER_DOMAIN` or revert domain changes - just in case if you changed for development
2. `npm run-script build-prod` - it creates archive `dist/timecamp-browser-extension-2.x.x.zip` and directory `dist/plugin` with same unzipped files
3. [Install plugin in browser](#instalation-in-browser)

## Build for development

1. Change backend url by creating environment variable:

   `export SERVER_DOMAIN=app.timecamp.local`

2. Run: `npm run build-dev` it creates `dist/plugin` directory

## Instalation in browser

1. Open `chrome://extensions/`
2. Select Developer mode
3. Disable current TimeCamp plugin if you have any
4. Click `Load unpacked` and select a folder where you have `dist/plugin`

## Version

Plugin version is stored only in `package.json`

Version from `package.json`:`version` is copied to `manifest.json`:`version`

## Development

1. Create branch: `fix/{projectId}-{taskId}-short-desc` ex. `fix/BP-3-format-change`
2. In `package.json` change version to `2.{currentValue}.{taskId}`
3. Commit changes
4. Make PR

## Debbugging

Steps to open background console:

1. Go to `chrome://extensions/`
2. Open `details` of extension
3. Click `background page` under `Inspect views`

## Other

[Extensions-reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid): Useful plugin for fast extension reloading
