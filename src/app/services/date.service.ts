import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateService {

    public constructor() {
    }

    public setDateTime(date: Date, hour: number, minute: number): Date {
        const newDate = new Date(date);
        newDate.setHours(hour);
        newDate.setMinutes(minute);
        newDate.setSeconds(0);
        return newDate;
    }

    public datetimeToDaySlashMonthString(date: Date): string {
        return this.dateMonthToString(date) + '/' + this.dateDayToString(date);
    }

    public utfDatetimeToLocalString(date: Date, separator: boolean): string {
        let charBetweenTimeAndDate = ' ';

        if (!separator) {
            charBetweenTimeAndDate = '';
        }
        return this.utfDatetimeToLocalDate(date, separator) + charBetweenTimeAndDate
            + this.utfDatetimeToLocalTime(date, separator);
    }

    public utfDatetimeToLocalDate(date: Date, separator: boolean): string {
        let dateSeparator = '-';
        if (!separator) {
            dateSeparator = '';
        }
        return date.getFullYear() + dateSeparator + this.dateMonthToString(date)
            + dateSeparator + this.dateDayToString(date);
    }

    public utfDatetimeToLocalTime(date: Date, separator: boolean): string {
        let timeSeparator = ':';
        if (!separator) {
            timeSeparator = '';
        }
        return this.dateHourToString(date) + timeSeparator + this.dateMinuteToString(date)
            + timeSeparator + this.dateSecondToString(date);
    }

    public dateMonthToString(date: Date): string {
        return date.getMonth() < 10 ? '0'.concat(date.getMonth().toString()) : date.getMonth().toString();
    }

    public dateDayToString(date: Date): string {
        return date.getDate() < 10 ? '0'.concat(date.getDay().toString()) : date.getDay().toString();
    }

    public dateHourToString(date: Date): string {
        return date.getHours() < 10 ? '0'.concat(date.getHours().toString()) : date.getHours().toString();
    }

    public dateMinuteToString(date: Date): string {
        return date.getMinutes() < 10 ? '0'.concat(date.getMinutes().toString()) : date.getMinutes().toString();
    }

    public dateSecondToString(date: Date): string {
        return date.getSeconds() < 10 ? '0'.concat(date.getSeconds().toString()) : date.getSeconds().toString();
    }
}
