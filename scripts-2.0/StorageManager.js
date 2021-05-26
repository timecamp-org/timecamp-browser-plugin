import browser from 'webextension-polyfill';
import Logger from './Logger';

const logger = new Logger();

export default class StorageManager {
    buildKey(params) {
        return params.join('_');
    }

    get(key) {
        return new Promise((resolve, reject) => {
            browser.storage.sync.get(key).then((items) => {
                let data = items[key];

                if (browser.runtime.lastError === undefined) {
                    resolve(data);
                } else {
                    logger.error(browser.runtime.lastError.message);
                    reject(browser.runtime.lastError.message);
                }
            }).catch((e) => {
                reject(e);
            });
        });
    }

    set(key, data) {
        return new Promise((resolve, reject) => {
            browser.storage.sync.set({[key]: data}).then(() => {
                if (browser.runtime.lastError === undefined) {
                    resolve();
                } else {
                    logger.error(browser.runtime.lastError.message);
                    reject(browser.runtime.lastError.message);
                }
            }).catch((e) => {
                reject(e);
            });
        });
    }
}
