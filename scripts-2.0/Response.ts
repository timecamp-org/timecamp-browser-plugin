import Error, {ERROR_MESSAGE, ErrorType} from "./Error";
import Logger from './Logger';
const logger = new Logger();

const MAINTENANCE_MODE_HEADER_KEY = 'Browser-plugin';
const MAINTENANCE_MODE_HEADER_VALUE = 'Maintenance mode';

export default class Response {
    hasError: boolean;
    error: Error;

    constructor(xhr: XMLHttpRequest) {
        this.detectError(xhr);

        if (this.hasError) {
            logger.log('[TC plugin]: ' + this.error.message, true)
        }
    }

    detectError = (xhr: XMLHttpRequest) => {
        this.hasError = false;
        const statusCode = xhr.status;
        const message = this.parseMessage(xhr.responseText);

        if (!window.navigator.onLine) {
            this.hasError = true;
            this.error = new Error('', ErrorType.NO_INTERNET);
            return;
        }

        if (statusCode >= 400) {
            const maintenanceModeHeaderKey = xhr.getResponseHeader(MAINTENANCE_MODE_HEADER_KEY)
            if (maintenanceModeHeaderKey === MAINTENANCE_MODE_HEADER_VALUE) {
                this.hasError = true;
                this.error = new Error(MAINTENANCE_MODE_HEADER_VALUE, ErrorType.MAINTENANCE_MODE);
                return;
            }

            if (statusCode === 401 && message === ERROR_MESSAGE[ErrorType.SUBSCRIPTION_EXPIRED]) {
                this.hasError = true;
                this.error = new Error(message, ErrorType.SUBSCRIPTION_EXPIRED);
                return;
            }

            this.hasError = true;
            this.error =  new Error(message, ErrorType.UNKNOWN);
        }
    }

    parseMessage = (message: string) => {
        try {
            const parsedMessage = JSON.parse(message)
            if (parsedMessage.hasOwnProperty('message')) {
                return parsedMessage.message;
            }

            if (parsedMessage.hasOwnProperty('Status')) {
                return parsedMessage.Status.message;
            }

            return message;
        } catch (e) {
            return message;
        }
    }
}
