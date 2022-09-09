import {Injectable} from '@angular/core';
import {Insomnia} from '@awesome-cordova-plugins/insomnia/ngx';
import {from, Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ScreenWakingService {

    public constructor(private insomnia: Insomnia) {
    }

    public keepScreenAwake(): Observable<any> {
        return from(this.insomnia.keepAwake())
            .pipe(
                catchError((err) => {
                    console.error(err);
                    return of(err);
                })
            );
    }

    public allowSleepAgain(): Observable<any> {
        return from(this.insomnia.allowSleepAgain())
            .pipe(
                catchError((err) => {
                    console.error(err);
                    return of(err);
                })
            );
    }
}
