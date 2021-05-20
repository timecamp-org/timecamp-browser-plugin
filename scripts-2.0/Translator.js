import Logger from './Logger';
const browser = require('webextension-polyfill');
const logger = new Logger();

const translate = function (message) {
    let translatedMessage = browser.i18n.getMessage(message);
    if (translatedMessage === '') {
        logger.warn('Missing translation for \"' + message + '\"', true);
            
        return message;
    }
        
    return translatedMessage;
}

export default translate;
