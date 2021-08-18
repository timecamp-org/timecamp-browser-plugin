export enum ErrorType {
    MAINTENANCE_MODE,
    NO_INTERNET,
    SUBSCRIPTION_EXPIRED,
    UNKNOWN
}

export const ERROR_MESSAGE = {
    [ErrorType.SUBSCRIPTION_EXPIRED]: 'This requires a paid plan. Upgrade by opening TimeCamp page.'
}

export default class Error {
    message: string;
    type: ErrorType;

    constructor(message: string, type: ErrorType) {
        this.message = message;
        this.type = type;
    }
}
