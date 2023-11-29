const AM = 'am';
const PM = 'pm';
export default class DateTime {
    constructor() {
    }

    getNow = () => {
        return new Date;
    }

    formatToYmdHis = (d) => {
        return [
                d.getFullYear(),
                this.padLeft(d.getMonth() + 1),
                this.padLeft(d.getDate())
            ]
                .join('-') + ' ' +
            [
                this.padLeft(d.getHours()),
                this.padLeft(d.getMinutes()),
                this.padLeft(d.getSeconds())
            ]
                .join(':')
            ;
    }

    formatToHis = (d) => {
        return [
            this.padLeft(d.getHours()),
            this.padLeft(d.getMinutes()),
            this.padLeft(d.getSeconds())
        ].join(':');
    }

    formatToYmd = (d) => {
        return [
                d.getFullYear(),
                this.padLeft(d.getMonth() + 1),
                this.padLeft(d.getDate())
            ].join('-');
    }

    padLeft = (data) => {
        return data.toString().padStart(2, '0');
    }

    getNowDateForDuration = () => {
        let now = new Date;
        now.setSeconds(0);
        now.setMilliseconds(0);

        return now;
    }

    getMinutes = (date) => {
        return this.padLeft(date.getMinutes());
    }

    getHours = (date, is24hFormat = true) => {
        let hours = date.getHours();
        if (!is24hFormat && hours > 12) {
            hours = hours - 12;
        }

        return this.padLeft(hours);
    }

    getMeridianValue = (date) => {
        const hours = date.getHours();
        if (hours >= 12) {
            return PM;
        }

        return AM;
    }
    getCurrentDate(){
        const today = this.getNow();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const yyyy = today.getFullYear();
        
        return yyyy+'-'+mm+'-'+dd;
    }
}
