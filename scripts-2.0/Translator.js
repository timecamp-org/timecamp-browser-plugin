import Logger from './Logger';
const browser = require('webextension-polyfill');
const logger = new Logger();

const translate = function (message) {
    let translatedMessage = browser.i18n.getMessage(message);
    if (translatedMessage === '') {
        return message;
    }
        
    return translatedMessage;
}

export default translate;
