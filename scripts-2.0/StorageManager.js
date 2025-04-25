import browser from 'webextension-polyfill';
import Logger from './Logger';

const logger = new Logger();

const TRELLO_POWER_UP_AD_VISIBLE = 'trello_power_up_ad_visible';

const STORAGE_KEY_DOMAIN = 'domain';

export default class StorageManager {
    static get TRELLO_POWER_UP_AD_VISIBLE() {
        return TRELLO_POWER_UP_AD_VISIBLE;
    }
    static get STORAGE_KEY_DOMAIN() {
        return STORAGE_KEY_DOMAIN;
    }

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

    clear() {
        return new Promise((resolve, reject) => {
            const keysToKeep = [StorageManager.STORAGE_KEY_DOMAIN];

            chrome.storage.sync.get(keysToKeep, (itemsToKeep) => {
                if (chrome.runtime.lastError) {
                    console.error("Error reading keys:", chrome.runtime.lastError);
                    reject();
                    return;
                }

                chrome.storage.sync.clear(() => {
                    if (chrome.runtime.lastError) {
                        console.error("Error clearing storage:", chrome.runtime.lastError);
                        reject();
                        return;
                    }

                    console.log("Storage cleared.");

                    chrome.storage.sync.set(itemsToKeep, () => {
                        if (chrome.runtime.lastError) {
                            console.error("Error restoring items:", chrome.runtime.lastError);
                            reject();
                            return;
                        } else {

                            console.log("Restored kept items:", itemsToKeep);
                            resolve(true);
                        }
                    });
                });
            });
        });
    }
}
