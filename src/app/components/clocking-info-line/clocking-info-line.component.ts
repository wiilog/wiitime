import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ClockingRecord} from '@app/services/sqlite/entities/clocking-record';

@Component({
    selector: 'app-clocking-info-line',
    templateUrl: './clocking-info-line.component.html',
    styleUrls: ['./clocking-info-line.component.scss'],
})
export class ClockingInfoLineComponent implements OnInit, OnDestroy {

    @Input()
    public linkedClocking: ClockingRecord;

    @Input()
    public isLastOfDay: boolean; //used for down border

    @Input()
    public dateText: string;

    @Input()
    public isFirst: boolean;

    public imagePath: string;

    private readonly dayLogoPath = '/assets/icon/jour.svg';
    private readonly nightLogoPath = '/assets/icon/nuit.svg';

    public constructor() {
    }

    public ngOnInit(): void {
        const clockingHour = new Date(this.linkedClocking.clocking_date).getHours();
        if (clockingHour >= 21 || clockingHour <= 6) {
            this.imagePath = this.nightLogoPath;
        } else {
            this.imagePath = this.dayLogoPath;
        }
    }

    public ngOnDestroy(): void {
    }

}
