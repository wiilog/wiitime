import {EventEmitter, Input, NgZone, Output} from '@angular/core';
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
    protected valueSetterSubscription: Subscription;
    protected saveSubscription: Subscription;

    protected constructor(protected screenOrientationService: ScreenOrientationService,
                          protected windowSizeService: WindowSizeService,
                          protected ngZone: NgZone,) {
        this.validFormSubmittedEvent = new EventEmitter<any>();
    }

    public updateViewAfterWindowSizeChanged(): void {
        this.showTitle = this.windowSizeService.getWindowWidth() < environment.minWindowWidthForSideMenu
            || this.screenOrientationService.isPortraitMode();
    }

    public getErrorControl() {
        return this.form.controls;
    }

    //Call in ngOnInit
    protected initSettingsMenu() {
        this.isSubmitted = false;
        this.updateViewAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateViewAfterWindowSizeChanged();
                });
            }
        );

        this.initContent();
    }

    //Call in ngAfterViewInit()
    protected initSubmitFormSubscription() {
        this.submitFormSubscription = this.submitForm$.subscribe(() => {
            this.formSubmitted();
        });
    }

    //Call in ngOnDestroy
    protected clearSubscriptionOnDestroy() {
        this.windowSizeSubscription.unsubscribe();

        if (this.valueSetterSubscription && !this.valueSetterSubscription.closed) {
            this.valueSetterSubscription.unsubscribe();
        }

        if (this.saveSubscription && !this.saveSubscription.closed) {
            this.saveSubscription.unsubscribe();
        }

        if (this.submitFormSubscription && !this.submitFormSubscription.closed) {
            this.submitFormSubscription.unsubscribe();
        }
    }

    protected abstract formSubmitted(): void;

    protected abstract initContent(): void;
}

