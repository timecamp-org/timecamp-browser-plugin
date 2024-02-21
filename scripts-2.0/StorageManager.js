import browser from 'webextension-polyfill';
import Logger from './Logger';

const logger = new Logger();

const TRELLO_POWER_UP_AD_VISIBLE = 'trello_power_up_ad_visible';
const TC_THEME = 'tc_theme';
const POMODORO_IS_ENABLED = 'pomodoro_is_enabled'
const POMODORO_TYPE = 'pomodoro_type'
const POMODORO_DURATION_VALUES = 'pomodoro_duration_values'
const POMODORO_IS_OPTIONS_OPEN = 'pomodoro_is_options_open'

export default class StorageManager {
    static get TRELLO_POWER_UP_AD_VISIBLE() {
        return TRELLO_POWER_UP_AD_VISIBLE;
    }

    static get TC_THEME() {
        return TC_THEME;
    }
    
    static get POMODORO_IS_ENABLED(){
        return POMODORO_IS_ENABLED;
    }

    static get POMODORO_TYPE(){
        return POMODORO_TYPE;
    }

    static get POMODORO_DURATION_VALUES(){
        return POMODORO_DURATION_VALUES;
    }

    static get POMODORO_IS_OPTIONS_OPEN(){
        return POMODORO_IS_OPTIONS_OPEN;
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
}
