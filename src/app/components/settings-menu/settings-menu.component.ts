import {EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {WindowSizeService} from '@app/services/window-size.service';
import {FormGroup} from '@angular/forms';

export abstract class SettingsMenuComponent {
    @Input()
    public submitForm$: Observable<string>;

    @Output()
    public validFormSubmittedEvent: EventEmitter<string>;

    public form: FormGroup;

    public showTitle: boolean;
    public isSubmitted: boolean;

    protected windowSizeSubscription: Subscription;
    protected submitFormSubscription: Subscription;

    protected constructor(protected screenOrientationService: ScreenOrientationService,
                          protected windowSizeService: WindowSizeService,) {
        this.validFormSubmittedEvent = new EventEmitter<any>();
    }

    public updateViewAfterWindowSizeChanged(): void {
        this.showTitle = this.windowSizeService.getWindowWidth() < environment.minWindowWidthForSideMenu
            || this.screenOrientationService.isPortraitMode();
    }

    public getErrorControl() {
        return this.form.controls;
    }

    public abstract formSubmitted(): void;
}

