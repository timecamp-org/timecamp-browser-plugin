export default class DateTime {
    constructor() {
    }

    now = () => {
        const d = new Date;
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

    padLeft = (data) => {
        return data.toString().padStart(2, '0');
    }
}
