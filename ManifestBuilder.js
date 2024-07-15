"use strict";

const integrations = require('./integrationList.json');

module.exports = {
    build: function (serverProtocol, serverDomain, browser, isDebug = false) {
        if (isDebug) {
            integrations.push({
                "matches": ["*://localhost/*/*"],
                "script": ["for-development-only.js"]
            })
        }

        if (browser === "firefox") {
            integrations.push({
                "matches": [serverProtocol + '://' + serverDomain + '/*'],
                "script": ["timecamp-firefox-helper.js"]
            })
        }

        let contentScripts = [];
        for (const integration of integrations) {
            if (!isDebug && integration.isActiveInProd !== true) {
                continue;
            }

            let item = {
                'matches': [
                    ...this.defaults.matches,
                    ...integration.matches
                ],
                'exclude_matches': [
                    ...this.defaults.exclude_matches,
                    ...(integration.exclude_matches ? integration.exclude_matches : [])
                ],
                'css': this.defaults.css,
                'js': [
                    ...this.defaults.js,
                    'scripts-2.0/third_party/' + integration.script,
                ],
            };

            if (item.exclude_matches.length === 0) {
                delete item.exclude_matches;
            }

            contentScripts.push(item);
        }

        return contentScripts;
    },
    defaults: {
        matches: [],
        exclude_matches: [],
        css: [
            'scripts-2.0/style/main.min.css',
        ],
        js: [
            'scripts-2.0/common.js',
        ],
    }
};

//Add this entires to integrations.json when custom domain feature will be done
// {
//     "matches": [""],
//     "script": ["doit.js"],
// },
// {
//     "matches": [""],
//     "script": ["eventum.js"],
// },
// {
//     "matches": [""],
//     "script": ["kanboard.js"],
// },
// {
//     "matches": [""],
//     "script": ["processwire.js"],
// },
// {
//     "matches": ["*://*.wekan.*/*"],
//     "script": ["wekan.js"],
// },
