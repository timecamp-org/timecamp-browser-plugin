const DURATION_FORMATS = {
    CLASSIC: 0,
    CLASSIC_WITH_SECONDS: 4,
    HHMM: 1,
    HHMMSS: 5,
    DECIMAL_COMMA: 2,
    DECIMAL_DOT: 3,
}

export default class TimeFormatter {
    constructor() {
    }

    format(dateString, format = DURATION_FORMATS.CLASSIC) {
        let seconds = this.getDiffInSeconds(dateString);

        return this.formatToDuration(seconds, format);
    }

    getDiffInSeconds = function (dateString) {
        let dateToCompare = new Date(dateString);
        let now = new Date();

        let diff = (now.getTime() - dateToCompare.getTime()) / 1000;
        diff = Math.abs(Math.round(diff));

        return diff;
    }

    formatToDuration = function (baseSeconds, format = DURATION_FORMATS.CLASSIC) {
        baseSeconds = parseInt(baseSeconds, 10);
        let hours   = Math.floor(baseSeconds / 3600);
        let minutes = Math.floor((baseSeconds - (hours * 3600)) / 60);
        let seconds = baseSeconds - (hours * 3600) - (minutes * 60);
        let decimal = null;

        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        switch (format) {
            case DURATION_FORMATS.CLASSIC_WITH_SECONDS:
                return hours + 'h ' + minutes + 'm ' + seconds + 's';

            case DURATION_FORMATS.HHMM:
                return hours + ':' + minutes;

            case DURATION_FORMATS.HHMMSS:
                return hours + ':' + minutes + ':' + seconds;

            case DURATION_FORMATS.DECIMAL_COMMA:
                decimal = this.makeDecimal(hours, minutes, seconds);
                decimal = decimal.replace('.', ',');
                return decimal + ' h';

            case DURATION_FORMATS.DECIMAL_DOT:
                decimal = this.makeDecimal(hours, minutes, seconds);
                return decimal + ' h';
                
            case DURATION_FORMATS.CLASSIC:
            default:
                return hours + 'h ' + minutes + 'm';
        }
    }

    makeDecimal = function (hours, minutes, seconds) {
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        seconds = parseInt(seconds);
        
        let decimal = hours + (minutes + (seconds / 60)) / 60;
        decimal = parseFloat(decimal).toFixed(2);

        return decimal;
    }
}