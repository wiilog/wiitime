import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateService {

    private static readonly ONE_DAY_IN_MILLISECOND = 24 * 60 * 60 * 1000;

    public constructor() {
    }

    private static FormatWithLeadingZero(n: number): string {
        const prefix = n < 10 ? '0' : '';
        return `${prefix}${n}`;
    }

    public setDateTime(date: Date, hour: number, minute: number): Date {
        const newDate = new Date(date);
        newDate.setHours(hour);
        newDate.setMinutes(minute);
        newDate.setSeconds(0);
        return newDate;
    }

    /**
     * Check if the first date is from the day before the day of the second date
     *
     * @param date1 a date
     * @param date2 an other date
     */
    public isFromDayBefore(date1, date2): boolean {
        const startOfDate1Day = new Date(date1);
        const startOfDate2Day = new Date(date2);
        startOfDate1Day.setHours(0, 0, 0, 0);
        startOfDate2Day.setHours(0, 0, 0, 0);
        return (startOfDate2Day.getTime() - startOfDate1Day.getTime()) === DateService.ONE_DAY_IN_MILLISECOND;
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
        return this.dateHoursToString(date) + timeSeparator + this.dateMinutesToString(date)
            + timeSeparator + this.dateSecondsToString(date);
    }

    public dateMonthToString(date: Date): string {
        return DateService.FormatWithLeadingZero(date.getMonth() + 1);
    }

    public dateDayToString(date: Date): string {
        return DateService.FormatWithLeadingZero(date.getDate());
    }

    public dateHoursToString(date: Date): string {
        return DateService.FormatWithLeadingZero(date.getHours());
    }

    public dateMinutesToString(date: Date): string {
        return DateService.FormatWithLeadingZero(date.getMinutes());
    }

    public dateSecondsToString(date: Date): string {
        return DateService.FormatWithLeadingZero(date.getSeconds());
    }
}
