const DEBUG = process.env.DEBUG;

export default class Logger {
    constructor() {
    }

    log = function (data, forceInProd = false) {
        if (DEBUG || forceInProd) {
            console.log(data);
        }
    }

    warn = function (data, forceInProd = false) {
        if (DEBUG || forceInProd) {
            console.warn(data);
        }
    }
    
    table = function (data, forceInProd = false) {
        if (DEBUG || forceInProd) {
            console.table(data);
        }
    }
    
    error = function (data, forceInProd = false) {
        if (DEBUG || forceInProd) {
            console.error(data);
        }
    }
}